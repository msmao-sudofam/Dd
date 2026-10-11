import type { Model } from "@/lib/types";
import type { GenerationRequest } from "./types";

interface ModelParams {
  duration_format?: "string" | "string_s" | "number";
  image_param?: string;
  /** null = model takes no aspect input (follows the image); "image_size" = FLUX-style enum */
  aspect_param?: string | null;
  defaults?: Record<string, unknown>;
}

const IMAGE_SIZE: Record<string, string> = {
  "9:16": "portrait_16_9",
  "16:9": "landscape_16_9",
  "1:1": "square_hd",
};

/** Map our generic request onto a model's input schema using its params_json hints. */
export function buildProviderInput(model: Model, req: GenerationRequest): Record<string, unknown> {
  const p = (model.params_json ?? {}) as ModelParams;
  const input: Record<string, unknown> = { ...(p.defaults ?? {}), prompt: req.prompt };

  if (req.duration && model.allowed_durations.length > 0) {
    input.duration =
      p.duration_format === "number" ? req.duration : p.duration_format === "string_s" ? `${req.duration}s` : String(req.duration);
  }

  if (req.aspectRatio && p.aspect_param !== null) {
    if (p.aspect_param === "image_size") input.image_size = IMAGE_SIZE[req.aspectRatio] ?? "portrait_16_9";
    else input[p.aspect_param ?? "aspect_ratio"] = req.aspectRatio;
  }

  if (req.imageUrl) input[p.image_param ?? "image_url"] = req.imageUrl;
  return input;
}

/** Pull the first media URL out of common provider output shapes. */
export function extractOutputUrl(output: unknown): string | undefined {
  if (!output) return undefined;
  if (typeof output === "string") return /^https?:|^data:/.test(output) ? output : undefined;
  if (Array.isArray(output)) {
    for (const o of output) {
      const u = extractOutputUrl(o);
      if (u) return u;
    }
    return undefined;
  }
  if (typeof output === "object") {
    const o = output as Record<string, unknown>;
    for (const k of ["video", "image", "images", "audio", "audio_url", "video_url", "output", "url"]) {
      const u = extractOutputUrl(o[k]);
      if (u) return u;
    }
  }
  return undefined;
}
