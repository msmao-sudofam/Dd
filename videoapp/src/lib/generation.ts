import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db, InsufficientCreditsError } from "@/lib/db";
import { sendEmail, videoReadyEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { moderateText, moderationMessage } from "@/lib/moderation";
import { apiCostFor, creditCostFor } from "@/lib/pricing";
import { adapterByName, adapterForModel, modelAvailable, webhookUrlFor, type ProviderResult } from "@/lib/providers";
import { postProcessOutput } from "@/lib/postprocess";
import { track } from "@/lib/analytics";
import type { Job, Model, Preset, Profile } from "@/lib/types";

export class GenerationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

export interface GenerateInput {
  modelId?: string;
  presetId?: string;
  prompt?: string;
  subject?: string;
  imagePath?: string | null;
  duration?: number | null;
  aspectRatio?: string | null;
  /** Mock providers only — lets tests (and M) exercise the refund path. */
  forceFail?: boolean;
}

export function renderPresetPrompt(preset: Pick<Preset, "prompt_template">, subject?: string): string {
  const s = (subject ?? "").trim() || "product";
  return preset.prompt_template.replaceAll("{subject}", s).replace(/\s+/g, " ").trim();
}

/** Resolve model/preset/params and validate them. Pure apart from DB reads. */
export async function resolveRequest(input: GenerateInput) {
  let preset: Preset | null = null;
  let model: Model | null = null;
  let prompt = (input.prompt ?? "").trim();
  let duration = input.duration ?? null;
  let aspect = input.aspectRatio ?? null;

  if (input.presetId) {
    preset = await db().getPreset(input.presetId);
    if (!preset || !preset.enabled) throw new GenerationError("Preset not found.", 404, "preset_not_found");
    model = await db().getModel(preset.model_id);
    prompt = renderPresetPrompt(preset, input.subject);
    const pp = preset.params_json as { duration?: number; aspect_ratio?: string };
    duration = pp.duration ?? duration;
    aspect = aspect ?? pp.aspect_ratio ?? null;
    if (preset.requires_image && !input.imagePath) throw new GenerationError("Upload a photo first.", 400, "image_required");
    if (preset.requires_subject && !(input.subject ?? "").trim())
      throw new GenerationError("Describe your subject first.", 400, "subject_required");
  } else if (input.modelId) {
    model = await db().getModel(input.modelId);
  }
  if (!model || !modelAvailable(model)) throw new GenerationError("Model not available.", 404, "model_not_found");

  if (!prompt) throw new GenerationError("Write a prompt.", 400, "prompt_required");
  if (prompt.length > 2000) throw new GenerationError("Prompt is too long (2000 characters max).", 400, "prompt_too_long");

  const needsImage = model.type === "i2v" || model.type === "i2i";
  if (needsImage && !input.imagePath) throw new GenerationError("This model needs an image.", 400, "image_required");
  const imagePath = needsImage || preset?.requires_image ? (input.imagePath ?? null) : null;

  if (model.allowed_durations.length) {
    duration = duration ?? model.default_duration;
    if (!duration || !model.allowed_durations.includes(duration))
      throw new GenerationError(`Duration must be one of ${model.allowed_durations.join(", ")}s.`, 400, "bad_duration");
  } else {
    duration = null;
  }

  aspect = aspect ?? (model.allowed_aspects.includes("9:16") ? "9:16" : model.allowed_aspects[0]);
  if (!model.allowed_aspects.includes(aspect))
    throw new GenerationError(`Aspect ratio must be one of ${model.allowed_aspects.join(", ")}.`, 400, "bad_aspect");

  return { model, preset, prompt, duration, aspect, imagePath, credits: creditCostFor(model, duration) };
}

/**
 * validate → check balance → moderation → debit → submit → job (BUILD_PLAN Phase 2).
 * The job row is inserted before the debit so the ledger can reference it.
 */
export async function startGeneration(profile: Profile, input: GenerateInput): Promise<Job> {
  const r = await resolveRequest(input);

  if (r.imagePath && !r.imagePath.startsWith(`${profile.id}/`))
    throw new GenerationError("Invalid upload.", 400, "bad_upload");

  if (profile.credits_balance < r.credits)
    throw new GenerationError(`You need ${r.credits} credits for this (you have ${profile.credits_balance}).`, 402, "insufficient_credits");

  const mod = await moderateText([r.prompt, input.subject].filter(Boolean).join("\n"));
  if (!mod.allowed) {
    await db().logModeration({ userId: profile.id, kind: "text", excerpt: r.prompt, reasons: mod.reasons, source: mod.source });
    throw new GenerationError(moderationMessage(mod.reasons), 422, "moderation_blocked");
  }

  const adapter = adapterForModel(r.model.provider);
  const job = await db().createJob({
    user_id: profile.id,
    model_id: r.model.id,
    preset_id: r.preset?.id ?? null,
    provider: adapter.name,
    output_type: r.model.type === "t2i" || r.model.type === "i2i" ? "image" : "video",
    status: "queued",
    credits_charged: r.credits,
    cost_usd: apiCostFor(r.model, r.duration),
    input_json: {
      prompt: r.prompt,
      subject: input.subject ?? null,
      image_path: r.imagePath,
      duration: r.duration,
      aspect_ratio: r.aspect,
      watermark: profile.plan === "free",
    },
  });

  try {
    await db().applyCredit({ userId: profile.id, delta: -r.credits, reason: "generation", jobId: job.id });
  } catch (e) {
    await db().updateJob(job.id, { status: "failed", error: "insufficient_credits", cost_usd: 0, completed_at: new Date().toISOString() });
    if (e instanceof InsufficientCreditsError)
      throw new GenerationError(`You need ${r.credits} credits for this.`, 402, "insufficient_credits");
    throw e;
  }

  try {
    const imageUrl = r.imagePath ? await db().objectUrl("uploads", r.imagePath, 3600) : null;
    const { requestId } = await adapter.submit(
      r.model,
      {
        prompt: r.prompt,
        imageUrl,
        duration: r.duration,
        aspectRatio: r.aspect,
        forceFail: adapter.name === "mock" && !!input.forceFail,
      },
      webhookUrlFor(adapter.name),
    );
    await track(profile.id, "generation_started", {
      model: r.model.slug,
      preset: r.preset?.slug ?? null,
      credits: r.credits,
      plan: profile.plan,
    });
    return await db().updateJob(job.id, { provider_request_id: requestId, status: "running" });
  } catch (e) {
    console.error("[generate] submit failed", (e as Error).message);
    // Never reached the provider, so it cost us nothing.
    await db().updateJob(job.id, { cost_usd: 0 });
    return (await failJob(job.id, `Submit failed: ${(e as Error).message}`)) ?? job;
  }
}

async function downloadOutput(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const mockPrefix = `${env.appUrl()}/mock/`;
  if (url.startsWith(mockPrefix)) {
    const file = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "mock", path.basename(url));
    const bytes = new Uint8Array(await readFile(file));
    return { bytes, contentType: file.endsWith(".mp4") ? "video/mp4" : "image/jpeg" };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const contentType = res.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  return { bytes: new Uint8Array(await res.arrayBuffer()), contentType };
}

const EXT: Record<string, string> = { "video/mp4": "mp4", "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Provider finished: copy output to our storage (provider URLs expire), mark succeeded. Idempotent. */
export async function completeJob(jobId: string, providerUrl: string): Promise<Job | null> {
  const job = await db().getJob(jobId);
  if (!job || (job.status !== "queued" && job.status !== "running")) return job;

  let file: { bytes: Uint8Array; contentType: string };
  try {
    file = await downloadOutput(providerUrl);
    if (!EXT[file.contentType]) {
      file.contentType = job.output_type === "video" ? "video/mp4" : file.contentType.startsWith("image/") ? file.contentType : "image/jpeg";
    }
    file = await postProcessOutput(job, file);
  } catch (e) {
    return failJob(jobId, `Could not store output: ${(e as Error).message}`);
  }
  const objectPath = `${job.user_id}/${job.id}.${EXT[file.contentType] ?? "bin"}`;
  await db().uploadObject("outputs", objectPath, file.bytes, file.contentType);
  const outputUrl = await db().objectUrl("outputs", objectPath);

  const done = await db().transitionJob(jobId, ["queued", "running"], {
    status: "succeeded",
    output_url: outputUrl,
    completed_at: new Date().toISOString(),
  });
  if (done) {
    await track(done.user_id, "generation_succeeded", { job: done.id, credits: done.credits_charged });
    const profile = await db().getProfile(done.user_id);
    if (profile?.email) {
      const mail = videoReadyEmail(outputUrl);
      await sendEmail(profile.email, mail.subject, mail.html);
    }
  }
  return done ?? (await db().getJob(jobId));
}

/** Mark failed and refund the credits exactly once. */
export async function failJob(jobId: string, error: string): Promise<Job | null> {
  const failed = await db().transitionJob(jobId, ["queued", "running"], {
    status: "failed",
    error: error.slice(0, 1000),
    completed_at: new Date().toISOString(),
  });
  if (!failed) return db().getJob(jobId);
  await track(failed.user_id, "generation_failed", { job: failed.id, error: error.slice(0, 200) });
  if (failed.credits_charged > 0) {
    await db().applyCredit({ userId: failed.user_id, delta: failed.credits_charged, reason: "refund", jobId: failed.id });
    return db().transitionJob(jobId, ["failed"], { status: "refunded" });
  }
  return failed;
}

export async function applyProviderResult(job: Job, result: ProviderResult): Promise<Job | null> {
  if (result.state === "succeeded" && result.outputUrl) return completeJob(job.id, result.outputUrl);
  if (result.state === "failed") return failJob(job.id, result.error ?? "Generation failed");
  return job;
}

const STALE_MS = 30 * 60_000;

/**
 * Poll-based fallback for lost webhooks (and local dev, where providers can't reach localhost).
 * Called when the client polls a pending job.
 */
export async function reconcileJob(job: Job): Promise<Job | null> {
  if (job.status !== "queued" && job.status !== "running") return job;
  if (!job.provider_request_id) {
    if (Date.now() - Date.parse(job.created_at) > 2 * 60_000) return failJob(job.id, "Never submitted");
    return job;
  }
  const model = await db().getModel(job.model_id);
  if (!model) return job;
  try {
    const result = await adapterByName(job.provider).status(model, job.provider_request_id);
    if (result.state !== "succeeded" && result.state !== "failed" && Date.now() - Date.parse(job.created_at) > STALE_MS) {
      return failJob(job.id, "Timed out");
    }
    return applyProviderResult(job, result);
  } catch (e) {
    console.error("[reconcile]", job.id, (e as Error).message);
    return job;
  }
}
