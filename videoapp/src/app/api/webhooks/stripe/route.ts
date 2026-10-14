import { handleStripeEvent, stripe } from "@/lib/billing";
import { env } from "@/lib/env";

// Stripe webhook: raw body + signature → idempotent credit grant via the ledger.
export async function POST(req: Request) {
  const secret = env.stripeWebhookSecret();
  if (!secret) return new Response("stripe webhooks not configured", { status: 503 });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return new Response(`invalid signature: ${(e as Error).message}`, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event);
    return Response.json({ received: true, ...result });
  } catch (e) {
    console.error("[stripe webhook]", event.type, e);
    return new Response("handler error", { status: 500 }); // Stripe retries
  }
}
