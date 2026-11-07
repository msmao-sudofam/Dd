import { db } from "@/lib/db";
import { applyProviderResult } from "@/lib/generation";
import { adapterByName } from "@/lib/providers";
import type { ProviderName } from "@/lib/types";

const PROVIDERS: ProviderName[] = ["fal", "replicate", "self", "mock"];

// Downloading + watermarking + re-uploading a clip can take a while.
export const maxDuration = 300;

// Provider completion webhooks: verify signature → copy output to storage → succeed, or fail + refund.
export async function POST(req: Request, ctx: RouteContext<"/api/webhooks/[provider]">) {
  const { provider } = await ctx.params;
  if (!PROVIDERS.includes(provider as ProviderName)) return new Response("unknown provider", { status: 404 });

  const raw = await req.text();
  const adapter = adapterByName(provider as ProviderName);
  let event;
  try {
    event = await adapter.verifyWebhook(req.headers, raw, new URL(req.url));
  } catch (e) {
    console.error(`[webhook:${provider}] verify error`, (e as Error).message);
    return new Response("verification unavailable", { status: 503 }); // provider retries
  }
  if (!event) return new Response("invalid signature", { status: 401 });

  const job = await db().findJobByProviderRequest(provider as ProviderName, event.requestId);
  if (!job) return Response.json({ ok: true, ignored: "unknown request" });

  await applyProviderResult(job, event.result);
  return Response.json({ ok: true });
}
