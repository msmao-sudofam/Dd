import { createHash, createHmac, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SEED_MODELS, SEED_UGC_ACTORS } from "@/lib/seed-data";
import { buildProviderInput, extractOutputUrl } from "@/lib/providers/input";
import { falAdapter, falAppRoot, verifyFalSignature } from "@/lib/providers/fal";
import { mockAdapter } from "@/lib/providers/mock";
import { replicateAdapter, verifyReplicateSignature } from "@/lib/providers/replicate";
import { selfAdapter } from "@/lib/providers/self";
import type { Model } from "@/lib/types";

const model = (slug: string) => ({ ...SEED_MODELS.find((m) => m.slug === slug)!, id: slug, created_at: "" }) as Model;

describe("buildProviderInput", () => {
  it("formats Veo durations with an s suffix and keeps defaults", () => {
    const i = buildProviderInput(model("veo-31"), { prompt: "p", duration: 8, aspectRatio: "9:16" });
    expect(i).toMatchObject({ prompt: "p", duration: "8s", aspect_ratio: "9:16", generate_audio: true, resolution: "720p" });
  });
  it("uses start_image_url and no aspect for Kling i2v", () => {
    const i = buildProviderInput(model("kling-3-i2v"), { prompt: "p", duration: 5, aspectRatio: "9:16", imageUrl: "https://x/img.png" });
    expect(i.start_image_url).toBe("https://x/img.png");
    expect(i).not.toHaveProperty("aspect_ratio");
    expect(i.duration).toBe("5");
  });
  it("maps aspect to FLUX image_size and omits duration", () => {
    const i = buildProviderInput(model("flux-schnell"), { prompt: "p", aspectRatio: "9:16", duration: 5 });
    expect(i.image_size).toBe("portrait_16_9");
    expect(i).not.toHaveProperty("duration");
  });
});

describe("output parsing", () => {
  it("extracts urls from common shapes", () => {
    expect(extractOutputUrl({ video: { url: "https://v.mp4" } })).toBe("https://v.mp4");
    expect(extractOutputUrl({ images: [{ url: "https://i.png" }] })).toBe("https://i.png");
    expect(extractOutputUrl(["https://a.mp4"])).toBe("https://a.mp4");
    expect(extractOutputUrl({ video_url: "https://w.mp4" })).toBe("https://w.mp4");
  });
  it("normalises fal webhook payloads", () => {
    expect(falAdapter.parseResult({ status: "OK", payload: { video: { url: "https://v" } } })).toEqual({ state: "succeeded", outputUrl: "https://v" });
    expect(falAdapter.parseResult({ status: "ERROR", error: "boom" })).toEqual({ state: "failed", error: "boom" });
    expect(falAdapter.parseResult({ status: "OK", payload: null, payload_error: "x" }).state).toBe("failed");
  });
  it("normalises replicate and runpod statuses", () => {
    expect(replicateAdapter.parseResult({ status: "succeeded", output: "https://o.mp4" }).outputUrl).toBe("https://o.mp4");
    expect(replicateAdapter.parseResult({ status: "failed", error: "e" }).state).toBe("failed");
    expect(selfAdapter.parseResult({ status: "COMPLETED", output: { video_url: "https://s.mp4" } }).outputUrl).toBe("https://s.mp4");
    expect(selfAdapter.parseResult({ status: "TIMED_OUT" }).state).toBe("failed");
    expect(selfAdapter.parseResult({ status: "IN_QUEUE" }).state).toBe("queued");
  });
  it("derives fal app roots for status urls", () => {
    expect(falAppRoot("fal-ai/kling-video/v3/standard/text-to-video")).toBe("fal-ai/kling-video");
    expect(falAppRoot("fal-ai/veo3.1")).toBe("fal-ai/veo3.1");
    expect(falAppRoot("workflows/me/my-flow")).toBe("workflows/me/my-flow");
  });
});

describe("webhook signatures", () => {
  it("verifies fal Ed25519 signatures and rejects tampering/staleness", async () => {
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const body = JSON.stringify({ request_id: "req-1", status: "OK", payload: {} });
    const ts = String(Math.floor(Date.now() / 1000));
    const msg = ["req-1", "user-1", ts, createHash("sha256").update(body).digest("hex")].join("\n");
    const sig = sign(null, Buffer.from(msg), privateKey).toString("hex");
    const headers = new Headers({
      "x-fal-webhook-request-id": "req-1",
      "x-fal-webhook-user-id": "user-1",
      "x-fal-webhook-timestamp": ts,
      "x-fal-webhook-signature": sig,
    });
    expect(await verifyFalSignature(headers, body, [publicKey])).toBe(true);
    expect(await verifyFalSignature(headers, body + " ", [publicKey])).toBe(false);
    expect(await verifyFalSignature(headers, body, [publicKey], Number(ts) + 3600)).toBe(false);
    const other = generateKeyPairSync("ed25519").publicKey;
    expect(await verifyFalSignature(headers, body, [other])).toBe(false);
    expect(await verifyFalSignature(headers, body, [other, publicKey])).toBe(true);
  });

  it("verifies replicate svix-style signatures", () => {
    const secretBytes = Buffer.from("super-secret-key-bytes");
    const secret = `whsec_${secretBytes.toString("base64")}`;
    const body = '{"id":"p1","status":"succeeded"}';
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = createHmac("sha256", secretBytes).update(`msg_1.${ts}.${body}`).digest("base64");
    const h = new Headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": `v1,bogus v1,${sig}` });
    expect(verifyReplicateSignature(h, body, secret)).toBe(true);
    expect(verifyReplicateSignature(h, body.replace("p1", "p2"), secret)).toBe(false);
    expect(verifyReplicateSignature(h, body, "")).toBe(false);
  });
});

describe("demo-mode samples (mock provider)", () => {
  process.env.MOCK_PROVIDER_WEBHOOKS = "false";
  process.env.MOCK_PROVIDER_DELAY_MS = "0";
  const hook = "http://localhost/hook";
  const video = async (req: { aspectRatio?: string; sample?: string | null }, slug = "ltx-i2v") => {
    const { requestId } = await mockAdapter.submit(model(slug), { prompt: "p", ...req }, hook);
    return (await mockAdapter.status(model(slug), requestId)).outputUrl!;
  };
  const avatar = async (sample?: string) => {
    const { requestId } = await mockAdapter.submitRaw!("fal-ai/kling-video/ai-avatar/v2/standard", {}, hook, { sample });
    return (await mockAdapter.statusRaw!("", requestId)).outputUrl!;
  };

  it("a vertical preset video gets that preset's own preview clip", async () => {
    expect(await video({ aspectRatio: "9:16", sample: "hero-shot" })).toMatch(/\/presets\/hero-shot\.mp4$/);
  });

  it("falls back to the generic sample for other aspects, unknown presets, unsafe slugs and images", async () => {
    expect(await video({ aspectRatio: "16:9", sample: "hero-shot" })).toMatch(/\/mock\/sample-16x9\.mp4$/);
    expect(await video({ aspectRatio: "9:16", sample: "no-such-preset" })).toMatch(/\/mock\/sample-9x16\.mp4$/);
    expect(await video({ aspectRatio: "9:16", sample: "../hero_shot" })).toMatch(/\/mock\/sample-9x16\.mp4$/);
    expect(await video({ aspectRatio: "9:16" })).toMatch(/\/mock\/sample-9x16\.mp4$/);
    expect(await video({ aspectRatio: "9:16", sample: "hero-shot" }, "flux-schnell")).toMatch(/\/mock\/sample-9x16\.jpg$/);
  });

  it("a UGC ad gets the chosen creator's talking clip, or the generic one for an uploaded creator", async () => {
    const withClip = SEED_UGC_ACTORS.filter((a) => a.preview_video_url);
    for (const a of withClip) expect(await avatar(a.slug)).toMatch(new RegExp(`/mock/ugc-avatar-${a.slug}\\.mp4$`));
    expect(await avatar("my-own-face")).toMatch(/\/mock\/ugc-avatar-9x16\.mp4$/);
    expect(await avatar()).toMatch(/\/mock\/ugc-avatar-9x16\.mp4$/);
  });
});
