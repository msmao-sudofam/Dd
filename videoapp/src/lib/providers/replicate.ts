import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { buildProviderInput, extractOutputUrl } from "./input";
import { ProviderError, type ProviderAdapter, type ProviderResult } from "./types";

const API = "https://api.replicate.com/v1";

async function rFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.replicateToken()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ProviderError(`replicate ${res.status}: ${JSON.stringify(body).slice(0, 300)}`, res.status);
  return body;
}

/** Svix-style: HMAC-SHA256(`${id}.${ts}.${body}`) with base64 secret (after `whsec_`). */
export function verifyReplicateSignature(headers: Headers, rawBody: string, secret: string, nowS = Date.now() / 1000) {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigHeader = headers.get("webhook-signature");
  if (!id || !ts || !sigHeader || !secret) return false;
  if (Math.abs(nowS - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest();
  return sigHeader.split(" ").some((part) => {
    const [, b64] = part.split(",");
    if (!b64) return false;
    const got = Buffer.from(b64, "base64");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

export const replicateAdapter: ProviderAdapter = {
  name: "replicate",

  async submit(model, req, webhookUrl) {
    const body = await rFetch(`/models/${model.provider_model_id}/predictions`, {
      method: "POST",
      body: JSON.stringify({
        input: buildProviderInput(model, req),
        webhook: webhookUrl,
        webhook_events_filter: ["completed"],
      }),
    });
    if (typeof body.id !== "string") throw new ProviderError("replicate: no prediction id");
    return { requestId: body.id };
  },

  async status(_model, requestId) {
    return this.parseResult(await rFetch(`/predictions/${requestId}`));
  },

  parseResult(raw): ProviderResult {
    const p = (raw ?? {}) as { status?: string; output?: unknown; error?: unknown };
    switch (p.status) {
      case "starting":
        return { state: "queued" };
      case "processing":
        return { state: "running" };
      case "succeeded": {
        const outputUrl = extractOutputUrl(p.output);
        return outputUrl ? { state: "succeeded", outputUrl } : { state: "failed", error: "no output url" };
      }
      case "failed":
      case "canceled":
        return { state: "failed", error: String(p.error ?? p.status) };
      default:
        return { state: "running" };
    }
  },

  async verifyWebhook(headers, rawBody) {
    if (!verifyReplicateSignature(headers, rawBody, env.replicateWebhookSecret())) return null;
    const body = JSON.parse(rawBody) as { id: string };
    return { requestId: body.id, result: this.parseResult(body) };
  },
};
