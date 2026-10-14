"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { moderateTextLocal } from "@/lib/moderation";

export type AdminFormState = { error?: string } | undefined;

const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true";
const json = z.string().transform((s, ctx) => {
  try {
    const v = JSON.parse(s || "{}");
    if (typeof v !== "object" || Array.isArray(v) || v === null) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    ctx.addIssue({ code: "custom", message: "params_json must be a JSON object" });
    return z.NEVER;
  }
});
const csvInts = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const optInt = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));

async function uploadIfPresent(file: FormDataEntryValue | null, kind: "video" | "image"): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ok = kind === "video" ? ["video/mp4"] : ["image/jpeg", "image/png", "image/webp"];
  if (!ok.includes(file.type)) throw new Error(`Unsupported ${kind} type ${file.type}`);
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `presets/${randomUUID()}.${ext}`;
  await db().uploadObject("outputs", path, new Uint8Array(await file.arrayBuffer()), file.type);
  return db().objectUrl("outputs", path);
}

const PresetSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers, dashes"),
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  category: z.enum(["camera-moves", "product-ads", "ugc", "effects", "viral"]),
  model_id: z.string().min(1),
  prompt_template: z.string().min(5).max(2000),
  params_json: json,
  thumbnail_url: z.string().max(500).nullable(),
  preview_video_url: z.string().max(500).nullable(),
  sort_order: z.coerce.number().int(),
});

export async function savePreset(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = PresetSchema.safeParse({
    id: form.get("id") || undefined,
    slug: form.get("slug"),
    name: form.get("name"),
    description: form.get("description") ?? "",
    category: form.get("category"),
    model_id: form.get("model_id"),
    prompt_template: form.get("prompt_template"),
    params_json: form.get("params_json") ?? "{}",
    thumbnail_url: (form.get("thumbnail_url") as string) || null,
    preview_video_url: (form.get("preview_video_url") as string) || null,
    sort_order: form.get("sort_order") || 100,
  });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  // Presets are ours, so hold them to the same IP / public-figure rules as user prompts.
  const mod = moderateTextLocal(`${parsed.data.name} ${parsed.data.prompt_template}`);
  if (!mod.allowed) return { error: `Preset blocked by moderation: ${mod.reasons.join(", ")}` };
  try {
    const video = await uploadIfPresent(form.get("preview_video_file"), "video");
    const thumb = await uploadIfPresent(form.get("thumbnail_file"), "image");
    await db().upsertPreset({
      ...parsed.data,
      preview_video_url: video ?? parsed.data.preview_video_url,
      thumbnail_url: thumb ?? parsed.data.thumbnail_url,
      requires_image: bool(form.get("requires_image")),
      requires_subject: bool(form.get("requires_subject")),
      is_featured: bool(form.get("is_featured")),
      enabled: bool(form.get("enabled")),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  redirect("/admin/presets?saved=1");
}

export async function deletePresetAction(form: FormData) {
  await requireAdmin();
  await db().deletePreset(String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/presets?deleted=1");
}

const ModelSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  provider: z.enum(["fal", "replicate", "self", "mock"]),
  provider_model_id: z.string().min(1).max(200),
  type: z.enum(["t2v", "i2v", "t2i", "i2i"]),
  tier: z.enum(["fast", "mid", "premium"]),
  credit_cost: z.coerce.number().int().positive(),
  api_cost_usd: z.coerce.number().min(0),
  sort_order: z.coerce.number().int(),
  params_json: json,
});

export async function saveModel(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = ModelSchema.safeParse({
    id: form.get("id") || undefined,
    slug: form.get("slug"),
    name: form.get("name"),
    description: form.get("description") ?? "",
    provider: form.get("provider"),
    provider_model_id: form.get("provider_model_id"),
    type: form.get("type"),
    tier: form.get("tier"),
    credit_cost: form.get("credit_cost"),
    api_cost_usd: form.get("api_cost_usd"),
    sort_order: form.get("sort_order") || 100,
    params_json: form.get("params_json") ?? "{}",
  });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  await db().upsertModel({
    ...parsed.data,
    credit_cost_per_second: optInt(form.get("credit_cost_per_second")),
    default_duration: optInt(form.get("default_duration")),
    max_duration: optInt(form.get("max_duration")),
    allowed_durations: csvInts(String(form.get("allowed_durations") ?? "")),
    allowed_aspects: csv(String(form.get("allowed_aspects") ?? "9:16")),
    enabled: bool(form.get("enabled")),
  });
  revalidatePath("/", "layout");
  redirect("/admin/models?saved=1");
}
