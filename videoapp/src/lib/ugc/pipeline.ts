import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db, InsufficientCreditsError } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail, videoReadyEmail } from "@/lib/email";
import { track } from "@/lib/analytics";
import { postProcessOutput } from "@/lib/postprocess";
import { adapterByName, adapterForModel, webhookUrlFor, type ProviderResult } from "@/lib/providers";
import type { Job, Profile, UgcActor, UgcProject, UgcScript, UgcStage } from "@/lib/types";
import { assembleUgc } from "./assemble";
import { estimateUgcCost, scriptText, UGC_COST, UGC_ENDPOINTS, type CaptionStyle, type UgcAspect, type UgcQuality } from "./config";

export class UgcError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface UgcAdSpec {
  script: UgcScript;
  aspect: UgcAspect;
  captions: CaptionStyle;
  broll: boolean;
  quality: UgcQuality;
  aiLabel: boolean;
  ctaLabel: string;
  /** mock providers only: fail at this stage to exercise refunds */
  failAt?: UgcStage;
}

interface StageData {
  project_id: string;
  actor_id: string;
  spec: UgcAdSpec;
  endpoint?: string;
  voice?: string;
  composite?: string;
  avatar?: string;
  broll?: string;
  spent_usd?: number;
}

const ORDER: UgcStage[] = ["voice", "composite", "avatar", "broll", "assemble", "done"];

const abs = (u: string) => (u.startsWith("http") ? u : `${env.appUrl()}${u}`);

async function actorImageUrl(actor: UgcActor): Promise<string> {
  if (actor.upload_path) return db().objectUrl("uploads", actor.upload_path, 3600);
  if (!actor.portrait_url) throw new UgcError("This creator has no portrait yet.", 400);
  return abs(actor.portrait_url);
}

function nextStage(after: UgcStage, d: StageData, project: UgcProject): UgcStage {
  let i = ORDER.indexOf(after) + 1;
  for (; i < ORDER.length; i++) {
    const s = ORDER[i];
    if (s === "composite" && !project.product_image_path) continue;
    if (s === "broll" && (!d.spec.broll || !project.product_image_path)) continue;
    return s;
  }
  return "done";
}

function stageCost(stage: UgcStage, d: StageData): number {
  const text = scriptText(d.spec.script);
  if (stage === "voice") return (text.length / 1000) * UGC_COST.voicePer1kChars;
  if (stage === "composite") return UGC_COST.composite;
  if (stage === "avatar") return estimateUgcCost(text, { quality: d.spec.quality, broll: false, hasProductImage: false }).seconds * UGC_COST.avatarPerSecond[d.spec.quality];
  if (stage === "broll") return UGC_COST.brollClip;
  return 0;
}

/** Build the provider input for a remote stage. */
async function stageInput(stage: UgcStage, d: StageData, actor: UgcActor, project: UgcProject) {
  const productUrl = project.product_image_path ? await db().objectUrl("uploads", project.product_image_path, 3600) : null;
  switch (stage) {
    case "voice":
      return {
        endpoint: UGC_ENDPOINTS.voice,
        input: { text: scriptText(d.spec.script), voice: actor.voice, speed: 1.05, stability: 0.45, similarity_boost: 0.75 },
      };
    case "composite":
      return {
        endpoint: UGC_ENDPOINTS.composite,
        input: {
          prompt:
            `Photorealistic vertical selfie-style UGC photo. The person from the first image holds the product from the second image at chest height and faces the camera. ` +
            `${actor.setting || "Bright home interior"}, natural window light, smartphone camera look. ` +
            `Keep the person's face, hair and skin exactly as in the first image. Keep the product's shape, colors and label exactly as in the second image, label facing camera.`,
          image_urls: [await actorImageUrl(actor), productUrl!],
          aspect_ratio: d.spec.aspect,
          num_images: 1,
          output_format: "jpeg",
        },
      };
    case "avatar":
      return {
        endpoint: UGC_ENDPOINTS.avatar[d.spec.quality],
        input: {
          image_url: d.composite ?? (await actorImageUrl(actor)),
          audio_url: d.voice!,
          prompt: "A friendly creator talking naturally to the camera, small hand gestures, authentic smartphone UGC video.",
          ...(d.spec.quality === "premium" ? { resolution: "720p" } : {}),
        },
      };
    case "broll":
      return {
        endpoint: UGC_ENDPOINTS.broll,
        input: {
          image_url: productUrl!,
          prompt: "Smooth slow orbit around the product, soft studio light, shallow depth of field, premium commercial b-roll.",
          duration: "6",
          aspect_ratio: d.spec.aspect === "9:16" ? "9:16" : "auto",
          resolution: "1080p",
          generate_audio: false,
        },
      };
    default:
      throw new Error(`stage ${stage} is not remote`);
  }
}

async function submitStage(job: Job, stage: UgcStage, d: StageData): Promise<Job | null> {
  const [actor, project] = await Promise.all([db().getUgcActor(d.actor_id), db().getUgcProject(d.project_id)]);
  if (!actor || !project) return failUgc(job.id, "Creator or project missing");
  if (stage === "assemble" || stage === "done") return runAssemble(job, d, project);
  const { endpoint, input } = await stageInput(stage, d, actor, project);
  const adapter = adapterForModel("fal");
  const { requestId } = await adapter.submitRaw!(endpoint, input, webhookUrlFor(adapter.name), { forceFail: d.spec.failAt === stage });
  return db().updateJob(job.id, {
    stage,
    provider: adapter.name,
    provider_request_id: requestId,
    status: "running",
    stage_data: { ...d, endpoint } as Record<string, unknown>,
  });
}

async function download(url: string): Promise<Uint8Array> {
  const mock = `${env.appUrl()}/mock/`;
  if (url.startsWith(mock)) {
    return new Uint8Array(await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "mock", path.basename(url))));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function runAssemble(job: Job, d: StageData, project: UgcProject): Promise<Job | null> {
  await db().updateJob(job.id, { stage: "assemble", stage_data: d as unknown as Record<string, unknown> });
  try {
    const video = await assembleUgc({
      avatar: await download(d.avatar!),
      broll: d.broll ? await download(d.broll) : null,
      aspect: d.spec.aspect,
      script: d.spec.script,
      captions: d.spec.captions,
      productName: project.product_name,
      ctaLabel: d.spec.ctaLabel,
      aiLabel: d.spec.aiLabel,
    });
    const file = await postProcessOutput(job, { bytes: video, contentType: "video/mp4" });
    const objectPath = `${job.user_id}/${job.id}.mp4`;
    await db().uploadObject("outputs", objectPath, file.bytes, file.contentType);
    const outputUrl = await db().objectUrl("outputs", objectPath);
    const done = await db().transitionJob(job.id, ["queued", "running"], {
      status: "succeeded",
      stage: "done",
      output_url: outputUrl,
      completed_at: new Date().toISOString(),
    });
    if (done) {
      await track(done.user_id, "generation_succeeded", { job: done.id, kind: "ugc", credits: done.credits_charged });
      const profile = await db().getProfile(done.user_id);
      if (profile?.email) {
        const mail = videoReadyEmail(outputUrl);
        await sendEmail(profile.email, mail.subject, mail.html);
      }
    }
    return done ?? db().getJob(job.id);
  } catch (e) {
    return failUgc(job.id, `Editing failed: ${(e as Error).message}`);
  }
}

/** Fail + refund (once). Cost reflects the stages that actually ran. */
export async function failUgc(jobId: string, error: string): Promise<Job | null> {
  const job = await db().getJob(jobId);
  if (job) {
    const d = (job.stage_data ?? {}) as unknown as StageData;
    await db().updateJob(jobId, { cost_usd: Math.round(((d.spent_usd ?? 0) + (job.stage ? stageCost(job.stage, d) : 0)) * 1000) / 1000 });
  }
  const failed = await db().transitionJob(jobId, ["queued", "running"], {
    status: "failed",
    error: error.slice(0, 1000),
    completed_at: new Date().toISOString(),
  });
  if (!failed) return db().getJob(jobId);
  await track(failed.user_id, "generation_failed", { job: failed.id, kind: "ugc", stage: failed.stage });
  if (failed.credits_charged > 0) {
    await db().applyCredit({ userId: failed.user_id, delta: failed.credits_charged, reason: "refund", jobId: failed.id });
    return db().transitionJob(jobId, ["failed"], { status: "refunded" });
  }
  return failed;
}

/** A stage finished (webhook or poll). Claims the stage first so duplicates can't double-submit. */
export async function advanceUgc(job: Job, result: ProviderResult): Promise<Job | null> {
  if (job.status !== "running" || !job.stage || !job.provider_request_id) return job;
  if (result.state === "queued" || result.state === "running") return job;
  if (result.state === "failed") return failUgc(job.id, `${job.stage} failed: ${result.error ?? "provider error"}`);
  const d = { ...(job.stage_data as unknown as StageData) };
  const stage = job.stage;
  d[stage as "voice" | "composite" | "avatar" | "broll"] = result.outputUrl;
  d.spent_usd = (d.spent_usd ?? 0) + stageCost(stage, d);
  const claimed = await db().claimJobRequest(job.id, job.provider_request_id, {
    provider_request_id: `${job.provider_request_id}:done`,
    stage_data: d as unknown as Record<string, unknown>,
  });
  if (!claimed) return db().getJob(job.id); // another handler is advancing this stage
  const project = await db().getUgcProject(d.project_id);
  if (!project) return failUgc(job.id, "Project missing");
  try {
    return await submitStage(claimed, nextStage(stage, d, project), d);
  } catch (e) {
    return failUgc(job.id, `Could not start next step: ${(e as Error).message}`);
  }
}

/** Poll fallback for lost webhooks / local dev. */
export async function reconcileUgc(job: Job): Promise<Job | null> {
  if (job.status !== "running" && job.status !== "queued") return job;
  const d = job.stage_data as unknown as StageData;
  const age = Date.now() - Date.parse(job.created_at);
  if (age > 45 * 60_000) return failUgc(job.id, "Timed out");
  if (job.stage === "assemble" || !job.provider_request_id || job.provider_request_id.endsWith(":done") || !d?.endpoint) return job;
  try {
    const result = await adapterByName(job.provider).statusRaw!(d.endpoint, job.provider_request_id);
    return advanceUgc(job, result);
  } catch (e) {
    console.error("[ugc reconcile]", job.id, (e as Error).message);
    return job;
  }
}

/** Create + charge + start one UGC ad (one script × one creator). */
export async function startUgcAd(profile: Profile, project: UgcProject, actor: UgcActor, spec: UgcAdSpec): Promise<Job> {
  const model = await db().getModel("ugc-studio");
  if (!model?.enabled) throw new UgcError("UGC Studio is not available.", 404);
  const text = scriptText(spec.script);
  const est = estimateUgcCost(text, { quality: spec.quality, broll: spec.broll, hasProductImage: !!project.product_image_path });
  const fresh = await db().getProfile(profile.id);
  if ((fresh?.credits_balance ?? 0) < est.credits)
    throw new UgcError(`You need ${est.credits} credits for this ad (you have ${fresh?.credits_balance ?? 0}).`, 402);

  const d: StageData = { project_id: project.id, actor_id: actor.id, spec, spent_usd: 0 };
  const job = await db().createJob({
    user_id: profile.id,
    model_id: model.id,
    provider: "fal",
    output_type: "video",
    status: "queued",
    kind: "ugc",
    stage: "voice",
    stage_data: d as unknown as Record<string, unknown>,
    credits_charged: est.credits,
    cost_usd: est.usd,
    input_json: {
      prompt: `${project.product_name} — ${spec.script.hook}`,
      aspect_ratio: spec.aspect,
      watermark: profile.plan === "free",
      actor: actor.name,
      angle: spec.script.angle,
    },
  });
  try {
    await db().applyCredit({ userId: profile.id, delta: -est.credits, reason: "generation", jobId: job.id });
  } catch (e) {
    await db().updateJob(job.id, { status: "failed", error: "insufficient_credits", cost_usd: 0, completed_at: new Date().toISOString() });
    if (e instanceof InsufficientCreditsError) throw new UgcError(`You need ${est.credits} credits for this ad.`, 402);
    throw e;
  }
  await track(profile.id, "generation_started", { kind: "ugc", credits: est.credits, quality: spec.quality, angle: spec.script.angle });
  try {
    return (await submitStage(job, "voice", d)) ?? job;
  } catch (e) {
    await db().updateJob(job.id, { cost_usd: 0 });
    return (await failUgc(job.id, `Submit failed: ${(e as Error).message}`)) ?? job;
  }
}
