// UGC Ad Studio — fal endpoints and cost model.
// Endpoint ids and input schemas verified against @fal-ai/client@1.10.1 types (src/types/endpoints.d.ts).
// PRICES ARE ESTIMATES (vendor pricing pages were unreachable from the build sandbox) — go-live Step 2
// re-checks them on fal.ai and updates this file. They are deliberately on the high side.
import { CREDIT_FLOOR_USD, MARKUP } from "@/lib/pricing";

export type UgcQuality = "standard" | "premium";
export type UgcAspect = "9:16" | "4:5" | "1:1";
export type CaptionStyle = "bold" | "clean" | "none";

export const UGC_ENDPOINTS = {
  /** text, voice, speed, stability → { audio: { url } } */
  voice: "fal-ai/elevenlabs/tts/turbo-v2.5",
  /** prompt, image_urls[], aspect_ratio → { images: [{ url }] } */
  composite: "fal-ai/nano-banana/edit",
  /** image_url, audio_url, prompt → { video: { url }, duration } */
  avatar: { standard: "fal-ai/kling-video/ai-avatar/v2/standard", premium: "fal-ai/bytedance/omnihuman/v1.5" },
  /** product b-roll: image_url, prompt, duration → { video: { url } } */
  broll: "fal-ai/ltx-2.3/image-to-video/fast",
} as const;

export const UGC_COST = {
  voicePer1kChars: 0.1, // ElevenLabs turbo on fal (estimate)
  composite: 0.04, // nano-banana edit, 1 image (estimate)
  avatarPerSecond: { standard: 0.12, premium: 0.2 }, // Kling AI Avatar v2 std / OmniHuman v1.5 (estimates)
  brollClip: 0.36, // LTX i2v fast, 6 s × $0.06
};

export const WORDS_PER_SECOND = 2.6;
export const MAX_SCRIPT_WORDS = 110; // ≈ 40 s
export const MAX_VARIATIONS = 6;

export const ASPECT_SIZE: Record<UgcAspect, { w: number; h: number }> = {
  "9:16": { w: 720, h: 1280 },
  "4:5": { w: 720, h: 900 },
  "1:1": { w: 720, h: 720 },
};

export function scriptText(s: { hook: string; body: string[]; cta: string }): string {
  return [s.hook, ...s.body, s.cta].map((x) => x.trim()).filter(Boolean).join(" ");
}

export function estimateSeconds(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(6, Math.ceil(words / WORDS_PER_SECOND) + 1);
}

/** Provider cost + credits for one ad. Credits use the same markup rule as every model (≥ 3x, worst-case credit price). */
export function estimateUgcCost(text: string, opts: { quality: UgcQuality; broll: boolean; hasProductImage: boolean }) {
  const seconds = estimateSeconds(text);
  const usd =
    (text.length / 1000) * UGC_COST.voicePer1kChars +
    (opts.hasProductImage ? UGC_COST.composite : 0) +
    seconds * UGC_COST.avatarPerSecond[opts.quality] +
    (opts.broll && opts.hasProductImage ? UGC_COST.brollClip : 0);
  const credits = Math.max(1, Math.ceil((usd * MARKUP[opts.quality === "premium" ? "premium" : "mid"]) / CREDIT_FLOOR_USD));
  return { seconds, usd: Math.round(usd * 1000) / 1000, credits };
}
