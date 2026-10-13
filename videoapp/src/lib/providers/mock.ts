// Mock provider: "returns a sample video after 5s" (BUILD_PLAN §6 rule 2). Used whenever a provider's
// key is missing or MOCK_PROVIDERS=true. Completion arrives both via a signed webhook to ourselves and
// via status polling, exactly like a real provider.
// The sample is the closest real clip we have: the chosen preset's own preview, or the chosen creator's talking
// clip. Anything else gets the generic sample for its aspect ratio.
import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import type { ProviderAdapter, ProviderResult } from "./types";

export const MOCK_SIGNATURE_HEADER = "x-mock-signature";
const delayMs = () => Number(process.env.MOCK_PROVIDER_DELAY_MS ?? 5000);

const aspectSlug = (a?: string | null) => (a === "16:9" ? "16x9" : a === "1:1" ? "1x1" : "9x16");

export function mockSign(body: string) {
  return createHmac("sha256", env.sessionSecret()).update(body).digest("hex");
}

const shipped = (...parts: string[]) => existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", ...parts));

function outcome(requestId: string, now = Date.now()): ProviderResult {
  // mock_<submittedAtMs>_<fail 0|1>_<video|image>_<aspect>_<rand>[_<sample slug>]
  const [, ts, fail, kind, aspect, , sample] = requestId.split("_");
  if (now - Number(ts) < delayMs()) return { state: "running" };
  if (fail === "1") return { state: "failed", error: "Mock provider: forced failure" };
  const base = `${env.appUrl()}/mock`;
  if (kind === "audio") return { state: "succeeded", outputUrl: `${base}/ugc-voice.mp3` };
  if (kind === "ugcimage") return { state: "succeeded", outputUrl: `${base}/ugc-portrait-9x16.jpg` };
  if (kind === "ugcavatar") {
    const own = `ugc-avatar-${sample}.mp4`;
    return { state: "succeeded", outputUrl: `${base}/${sample && shipped("mock", own) ? own : "ugc-avatar-9x16.mp4"}` };
  }
  // Preset previews are vertical, so they only stand in for vertical videos.
  if (kind === "video" && aspect === "9x16" && sample && shipped("presets", `${sample}.mp4`))
    return { state: "succeeded", outputUrl: `${env.appUrl()}/presets/${sample}.mp4` };
  const ext = kind === "image" ? "jpg" : "mp4";
  return { state: "succeeded", outputUrl: `${base}/sample-${aspect}.${ext}` };
}

export const mockAdapter: ProviderAdapter = {
  name: "mock",

  async submit(model, req, webhookUrl) {
    const kind = model.type === "t2i" || model.type === "i2i" ? "image" : "video";
    return mockSubmit(kind, aspectSlug(req.aspectRatio), !!req.forceFail, webhookUrl, req.sample);
  },

  async submitRaw(endpointId, input, webhookUrl, opts) {
    const kind = /tts|speech/.test(endpointId)
      ? "audio"
      : /avatar|omnihuman/.test(endpointId)
        ? "ugcavatar"
        : /edit|nano-banana/.test(endpointId)
          ? "ugcimage"
          : "video";
    return mockSubmit(kind, aspectSlug(input.aspect_ratio as string | undefined), !!opts?.forceFail, webhookUrl, opts?.sample);
  },

  async statusRaw(_endpointId, requestId) {
    return outcome(requestId);
  },

  async status(_model, requestId) {
    return outcome(requestId);
  },

  parseResult(raw) {
    const r = raw as ProviderResult;
    return { state: r.state, outputUrl: r.outputUrl, error: r.error };
  },

  async verifyWebhook(headers, rawBody) {
    const got = headers.get(MOCK_SIGNATURE_HEADER) ?? "";
    const want = mockSign(rawBody);
    if (got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return null;
    const body = JSON.parse(rawBody) as { request_id: string } & ProviderResult;
    return { requestId: body.request_id, result: this.parseResult(body) };
  },
};

async function mockSubmit(kind: string, aspect: string, fail: boolean, webhookUrl: string, sample?: string | null) {
  const slug = sample && /^[a-z0-9-]+$/.test(sample) ? `_${sample}` : "";
  const requestId = `mock_${Date.now()}_${fail ? 1 : 0}_${kind}_${aspect}_${Math.random().toString(36).slice(2, 8)}${slug}`;
  if (process.env.MOCK_PROVIDER_WEBHOOKS !== "false") {
    setTimeout(() => {
      const body = JSON.stringify({ request_id: requestId, ...outcome(requestId) });
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", [MOCK_SIGNATURE_HEADER]: mockSign(body) },
        body,
      }).catch(() => {
        /* polling picks it up */
      });
    }, delayMs() + 50).unref?.();
  }
  return { requestId };
}
