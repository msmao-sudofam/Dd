import { createHash, createPublicKey, verify, type KeyObject } from "node:crypto";
import { env } from "@/lib/env";
import { buildProviderInput, extractOutputUrl } from "./input";
import { ProviderError, type ProviderAdapter, type ProviderResult } from "./types";

const QUEUE = "https://queue.fal.run";
const JWKS_URLS = ["https://rest.fal.ai/.well-known/jwks.json", "https://rest.alpha.fal.ai/.well-known/jwks.json"];
const TOLERANCE_S = 300;

/** Status/result URLs use only `owner/alias`, e.g. fal-ai/kling-video/v3/... → fal-ai/kling-video. */
export function falAppRoot(endpointId: string): string {
  const parts = endpointId.split("/");
  if (parts[0] === "workflows" || parts[0] === "comfy") return parts.slice(0, 3).join("/");
  return parts.slice(0, 2).join("/");
}

async function falFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Key ${env.falKey()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const detail = typeof body === "object" && body && "detail" in body ? JSON.stringify((body as { detail: unknown }).detail) : text;
    throw new ProviderError(`fal ${res.status}: ${String(detail).slice(0, 300)}`, res.status);
  }
  return body as Record<string, unknown>;
}

// --- webhook signature (Ed25519 over request_id\nuser_id\ntimestamp\nsha256(body)) ---------------
let jwksCache: { keys: KeyObject[]; at: number } | null = null;

async function falPublicKeys(): Promise<KeyObject[]> {
  if (jwksCache && Date.now() - jwksCache.at < 24 * 3600_000) return jwksCache.keys;
  for (const url of JWKS_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const { keys } = (await res.json()) as { keys: { kty: string; crv: string; x: string }[] };
      const parsed = keys
        .filter((k) => k.kty === "OKP" && k.crv === "Ed25519")
        .map((k) => createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: k.x }, format: "jwk" }));
      if (parsed.length) {
        jwksCache = { keys: parsed, at: Date.now() };
        return parsed;
      }
    } catch {}
  }
  throw new Error("Could not load fal JWKS");
}

export async function verifyFalSignature(
  headers: Headers,
  rawBody: string,
  keys: KeyObject[],
  nowS = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const requestId = headers.get("x-fal-webhook-request-id");
  const userId = headers.get("x-fal-webhook-user-id");
  const timestamp = headers.get("x-fal-webhook-timestamp");
  const signature = headers.get("x-fal-webhook-signature");
  if (!requestId || !userId || !timestamp || !signature) return false;
  if (!/^\d+$/.test(timestamp) || Math.abs(nowS - Number(timestamp)) > TOLERANCE_S) return false;
  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const message = Buffer.from([requestId, userId, timestamp, bodyHash].join("\n"), "utf8");
  let sig: Buffer;
  try {
    sig = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  return keys.some((k) => {
    try {
      return verify(null, message, k, sig);
    } catch {
      return false;
    }
  });
}

export const falAdapter: ProviderAdapter = {
  name: "fal",

  async submit(model, req, webhookUrl) {
    const url = `${QUEUE}/${model.provider_model_id}?fal_webhook=${encodeURIComponent(webhookUrl)}`;
    const body = await falFetch(url, { method: "POST", body: JSON.stringify(buildProviderInput(model, req)) });
    if (typeof body.request_id !== "string") throw new ProviderError("fal: no request_id in submit response");
    return { requestId: body.request_id };
  },

  async status(model, requestId) {
    const root = `${QUEUE}/${falAppRoot(model.provider_model_id)}/requests/${requestId}`;
    const st = await falFetch(`${root}/status`);
    if (st.status === "IN_QUEUE") return { state: "queued" };
    if (st.status === "IN_PROGRESS") return { state: "running" };
    if (st.status !== "COMPLETED") return { state: "running" };
    try {
      const result = await falFetch(root);
      return this.parseResult({ status: "OK", payload: result });
    } catch (e) {
      return { state: "failed", error: (e as Error).message };
    }
  },

  parseResult(raw): ProviderResult {
    const r = (raw ?? {}) as { status?: string; payload?: unknown; error?: string; payload_error?: string };
    if (r.status === "ERROR") {
      const detail = r.error ?? (r.payload ? JSON.stringify(r.payload).slice(0, 300) : "provider error");
      return { state: "failed", error: detail };
    }
    if (r.payload == null && r.payload_error) return { state: "failed", error: `payload_error: ${r.payload_error}` };
    const outputUrl = extractOutputUrl(r.payload);
    return outputUrl ? { state: "succeeded", outputUrl } : { state: "failed", error: "no output url in result" };
  },

  async verifyWebhook(headers, rawBody) {
    if (!headers.get("x-fal-webhook-signature")) return null; // don't fetch JWKS for unsigned junk
    if (!(await verifyFalSignature(headers, rawBody, await falPublicKeys()))) return null;
    const body = JSON.parse(rawBody) as { request_id: string };
    return { requestId: body.request_id, result: this.parseResult(body) };
  },
};
