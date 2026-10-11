// Mock provider: "returns a sample video after 5s" (BUILD_PLAN §6 rule 2). Used whenever a provider's
// key is missing or MOCK_PROVIDERS=true. Completion arrives both via a signed webhook to ourselves and
// via status polling, exactly like a real provider.
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import type { ProviderAdapter, ProviderResult } from "./types";

export const MOCK_SIGNATURE_HEADER = "x-mock-signature";
const delayMs = () => Number(process.env.MOCK_PROVIDER_DELAY_MS ?? 5000);

const aspectSlug = (a?: string | null) => (a === "16:9" ? "16x9" : a === "1:1" ? "1x1" : "9x16");

export function mockSign(body: string) {
  return createHmac("sha256", env.sessionSecret()).update(body).digest("hex");
}

function outcome(requestId: string, now = Date.now()): ProviderResult {
  // mock_<submittedAtMs>_<fail 0|1>_<video|image>_<aspect>_<rand>
  const [, ts, fail, kind, aspect] = requestId.split("_");
  if (now - Number(ts) < delayMs()) return { state: "running" };
  if (fail === "1") return { state: "failed", error: "Mock provider: forced failure" };
  const ext = kind === "image" ? "jpg" : "mp4";
  return { state: "succeeded", outputUrl: `${env.appUrl()}/mock/sample-${aspect}.${ext}` };
}

export const mockAdapter: ProviderAdapter = {
  name: "mock",

  async submit(model, req, webhookUrl) {
    const kind = model.type === "t2i" || model.type === "i2i" ? "image" : "video";
    const requestId = `mock_${Date.now()}_${req.forceFail ? 1 : 0}_${kind}_${aspectSlug(req.aspectRatio)}_${Math.random().toString(36).slice(2, 8)}`;

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
