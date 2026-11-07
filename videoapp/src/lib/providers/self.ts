// Self-hosted open-weight models (Wan / LTX) on RunPod Serverless — the cheap "Fast" tier (Phase 5).
// Worker contract (see docs/SELF_HOSTED.md): input = our provider input + { model }, output = { video_url }.
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { buildProviderInput, extractOutputUrl } from "./input";
import { ProviderError, type ProviderAdapter, type ProviderResult } from "./types";

const base = () => `https://api.runpod.ai/v2/${env.runpodEndpointId()}`;

async function rpFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.runpodApiKey()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ProviderError(`runpod ${res.status}: ${JSON.stringify(body).slice(0, 300)}`, res.status);
  return body;
}

function tokenOk(got: string | null): boolean {
  const want = env.selfWebhookSecret();
  if (!want || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const selfAdapter: ProviderAdapter = {
  name: "self",

  async submit(model, req, webhookUrl) {
    // RunPod doesn't sign webhooks, so we authenticate them with a secret token in the URL.
    const hook = `${webhookUrl}?token=${encodeURIComponent(env.selfWebhookSecret())}`;
    const body = await rpFetch("/run", {
      method: "POST",
      body: JSON.stringify({
        input: { ...buildProviderInput(model, req), model: model.provider_model_id },
        webhook: hook,
        policy: { executionTimeout: 10 * 60_000, ttl: 60 * 60_000 },
      }),
    });
    if (typeof body.id !== "string") throw new ProviderError("runpod: no job id");
    return { requestId: body.id };
  },

  async status(_model, requestId) {
    return this.parseResult(await rpFetch(`/status/${requestId}`));
  },

  parseResult(raw): ProviderResult {
    const j = (raw ?? {}) as { status?: string; output?: unknown; error?: unknown };
    switch (j.status) {
      case "IN_QUEUE":
        return { state: "queued" };
      case "IN_PROGRESS":
        return { state: "running" };
      case "COMPLETED": {
        const outputUrl = extractOutputUrl(j.output);
        return outputUrl ? { state: "succeeded", outputUrl } : { state: "failed", error: "worker returned no video_url" };
      }
      case "FAILED":
      case "CANCELLED":
      case "TIMED_OUT":
        return { state: "failed", error: String(j.error ?? j.status) };
      default:
        return { state: "running" };
    }
  },

  async verifyWebhook(_headers, rawBody, url) {
    if (!tokenOk(url.searchParams.get("token"))) return null;
    const body = JSON.parse(rawBody) as { id: string };
    return { requestId: body.id, result: this.parseResult(body) };
  },
};
