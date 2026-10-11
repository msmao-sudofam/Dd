import "server-only";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { env, isMockStripe } from "@/lib/env";
import { CREDIT_PACKS, MONTHLY_PLAN, type CreditPack } from "@/lib/pricing";
import { onPurchaseCompleted } from "@/lib/referrals";
import type { Profile } from "@/lib/types";

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  // Webhook verification works with only STRIPE_WEBHOOK_SECRET, so fall back to a dummy key.
  stripeClient ??= new Stripe(env.stripeSecretKey() || "sk_test_webhook_verification_only");
  return stripeClient;
}

export type ProductId = CreditPack["id"] | "monthly";

export function productById(id: string) {
  const pack = CREDIT_PACKS.find((p) => p.id === id);
  if (pack) return { kind: "pack" as const, pack };
  if (id === MONTHLY_PLAN.id) return { kind: "monthly" as const };
  return null;
}

/** Returns the URL to send the user to (Stripe Checkout, or straight back in mock mode). */
export async function createCheckout(profile: Profile, productId: ProductId): Promise<string> {
  const product = productById(productId);
  if (!product) throw new Error("Unknown product");
  const success = `${env.appUrl()}/billing?success=1`;
  const cancel = `${env.appUrl()}/billing?canceled=1`;

  if (isMockStripe()) {
    // Mock Stripe: synthesise the same events Stripe would send and run them through the real handler.
    await handleStripeEvent(mockCheckoutEvent(profile, productId));
    if (product.kind === "monthly") await handleStripeEvent(mockInvoicePaidEvent(profile, "subscription_create"));
    return `${success}&mock=1`;
  }

  const common = {
    client_reference_id: profile.id,
    customer: profile.stripe_customer_id ?? undefined,
    customer_email: profile.stripe_customer_id ? undefined : profile.email,
    success_url: `${success}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancel,
    allow_promotion_codes: true,
  } satisfies Partial<Stripe.Checkout.SessionCreateParams>;

  const session =
    product.kind === "pack"
      ? await stripe().checkout.sessions.create({
          ...common,
          mode: "payment",
          customer_creation: profile.stripe_customer_id ? undefined : "always",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: Math.round(product.pack.priceUsd * 100),
                product_data: { name: `${product.pack.name} — ${product.pack.credits} credits` },
              },
            },
          ],
          metadata: { userId: profile.id, productId, credits: String(product.pack.credits) },
          payment_intent_data: { metadata: { userId: profile.id, productId } },
        })
      : await stripe().checkout.sessions.create({
          ...common,
          mode: "subscription",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: Math.round(MONTHLY_PLAN.priceUsd * 100),
                recurring: { interval: "month" },
                product_data: { name: `${MONTHLY_PLAN.name} — ${MONTHLY_PLAN.creditsPerCycle} credits / month` },
              },
            },
          ],
          metadata: { userId: profile.id, productId },
          subscription_data: {
            metadata: { userId: profile.id, productId, credits: String(MONTHLY_PLAN.creditsPerCycle) },
          },
        });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function createPortalUrl(profile: Profile): Promise<string | null> {
  if (isMockStripe() || !profile.stripe_customer_id) return null;
  const s = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${env.appUrl()}/billing`,
  });
  return s.url;
}

function customerId(c: string | { id: string } | null | undefined): string | null {
  if (!c) return null;
  return typeof c === "string" ? c : c.id;
}

export interface HandleResult {
  handled: boolean;
  credited?: number;
  duplicate?: boolean;
}

/**
 * Applies a verified Stripe event. Idempotent: credits go through the ledger keyed by the
 * checkout session / invoice id, so replays and sibling events can never double-credit.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<HandleResult> {
  const result = await applyStripeEvent(event);
  // Recorded only after success so a crash mid-way lets Stripe's retry finish the job.
  await db().recordStripeEvent(event.id, event.type);
  return result;
}

async function applyStripeEvent(event: Stripe.Event): Promise<HandleResult> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId ?? s.client_reference_id;
      if (!userId) return { handled: false };
      const cust = customerId(s.customer);
      if (cust) await db().updateProfile(userId, { stripe_customer_id: cust });

      if (s.mode === "subscription") {
        const subId = customerId(s.subscription as string | { id: string } | null);
        await db().updateProfile(userId, { plan: "monthly", stripe_subscription_id: subId });
        return { handled: true }; // credits arrive with invoice.paid
      }
      if (s.payment_status !== "paid") return { handled: true }; // async methods: wait for async_payment_succeeded
      const credits = Number(s.metadata?.credits ?? 0);
      if (!credits) return { handled: false };
      const r = await db().applyCredit({
        userId,
        delta: credits,
        reason: "purchase",
        stripeEventId: `cs:${s.id}`,
        meta: { event: event.id, productId: s.metadata?.productId, amount_total: s.amount_total },
      });
      if (r.applied) {
        const p = await db().getProfile(userId);
        if (p?.plan === "free") await db().updateProfile(userId, { plan: "paid" });
        await onPurchaseCompleted(userId, `cs:${s.id}`);
      }
      return { handled: true, credited: r.applied ? credits : 0, duplicate: !r.applied };
    }

    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      const details = inv.parent?.subscription_details;
      const meta = details?.metadata ?? {};
      let userId: string | null = meta.userId ?? null;
      if (!userId) userId = (await db().getProfileByStripeCustomer(customerId(inv.customer) ?? ""))?.id ?? null;
      if (!userId) return { handled: false };
      const credits = Number(meta.credits ?? MONTHLY_PLAN.creditsPerCycle);
      const r = await db().applyCredit({
        userId,
        delta: credits,
        reason: "subscription",
        stripeEventId: `in:${inv.id}`,
        meta: { event: event.id, billing_reason: inv.billing_reason, amount_paid: inv.amount_paid },
      });
      await db().updateProfile(userId, {
        plan: "monthly",
        stripe_customer_id: customerId(inv.customer),
        stripe_subscription_id: customerId(details?.subscription as string | { id: string } | null),
      });
      if (r.applied) await onPurchaseCompleted(userId, `in:${inv.id}`);
      return { handled: true, credited: r.applied ? credits : 0, duplicate: !r.applied };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const p =
        (sub.metadata?.userId && (await db().getProfile(sub.metadata.userId))) ||
        (await db().getProfileByStripeCustomer(customerId(sub.customer) ?? ""));
      if (!p) return { handled: false };
      await db().updateProfile(p.id, { plan: "paid", stripe_subscription_id: null });
      return { handled: true };
    }

    default:
      return { handled: false };
  }
}

// --- mock events (same shape Stripe sends; only the fields we read) -----------------------------

export function mockCheckoutEvent(profile: Profile, productId: ProductId, sessionId = `cs_mock_${randomUUID()}`): Stripe.Event {
  const product = productById(productId)!;
  return {
    id: `evt_mock_${randomUUID()}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        mode: product.kind === "pack" ? "payment" : "subscription",
        payment_status: "paid",
        client_reference_id: profile.id,
        customer: profile.stripe_customer_id ?? `cus_mock_${profile.id.slice(0, 8)}`,
        subscription: product.kind === "monthly" ? `sub_mock_${profile.id.slice(0, 8)}` : null,
        amount_total: product.kind === "pack" ? product.pack.priceUsd * 100 : MONTHLY_PLAN.priceUsd * 100,
        metadata: {
          userId: profile.id,
          productId,
          ...(product.kind === "pack" ? { credits: String(product.pack.credits) } : {}),
        },
      },
    },
  } as unknown as Stripe.Event;
}

export function mockInvoicePaidEvent(profile: Profile, billingReason: string, invoiceId = `in_mock_${randomUUID()}`): Stripe.Event {
  return {
    id: `evt_mock_${randomUUID()}`,
    type: "invoice.paid",
    data: {
      object: {
        id: invoiceId,
        object: "invoice",
        billing_reason: billingReason,
        amount_paid: MONTHLY_PLAN.priceUsd * 100,
        customer: profile.stripe_customer_id ?? `cus_mock_${profile.id.slice(0, 8)}`,
        parent: {
          type: "subscription_details",
          subscription_details: {
            subscription: `sub_mock_${profile.id.slice(0, 8)}`,
            metadata: { userId: profile.id, productId: "monthly", credits: String(MONTHLY_PLAN.creditsPerCycle) },
          },
        },
      },
    },
  } as unknown as Stripe.Event;
}
