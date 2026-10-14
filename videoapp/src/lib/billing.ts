import "server-only";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { env, isMockStripe } from "@/lib/env";
import { CREDIT_PACKS, MONTHLY_PLAN, MONTHLY_PLANS, monthlyPlanById, subscribedPlan, type CreditPack, type MonthlyPlan } from "@/lib/pricing";
import { onPurchaseCompleted } from "@/lib/referrals";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/types";

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  // Webhook verification works with only STRIPE_WEBHOOK_SECRET, so fall back to a dummy key.
  stripeClient ??= new Stripe(env.stripeSecretKey() || "sk_test_webhook_verification_only");
  return stripeClient;
}

export type ProductId = CreditPack["id"] | MonthlyPlan["id"];

export function productById(id: string) {
  const pack = CREDIT_PACKS.find((p) => p.id === id);
  if (pack) return { kind: "pack" as const, pack };
  const plan = monthlyPlanById(id);
  if (plan) return { kind: "monthly" as const, plan };
  return null;
}

/** Each plan bills against one fixed Stripe product, so an invoice line says which plan it charged for. */
export const planProductId = (plan: MonthlyPlan) => `videoapp_plan_${plan.id.replace(/-/g, "_")}`;
const planByProductId = (id: string | null | undefined) => MONTHLY_PLANS.find((p) => planProductId(p) === id) ?? null;

async function ensurePlanProduct(plan: MonthlyPlan): Promise<string> {
  const id = planProductId(plan);
  const code = (e: unknown) => (e as { code?: string }).code;
  try {
    await stripe().products.retrieve(id);
  } catch (e) {
    if (code(e) !== "resource_missing") throw e;
    try {
      await stripe().products.create({ id, name: `${env.brandName()} ${plan.name} plan` });
    } catch (e2) {
      if (code(e2) !== "resource_already_exists") throw e2; // a parallel request created it first
    }
  }
  return id;
}

const planPrice = (plan: MonthlyPlan, product: string) => ({
  currency: "usd",
  product,
  recurring: { interval: "month" as const },
  unit_amount: Math.round(plan.priceUsd * 100),
});
const planMetadata = (userId: string, plan: MonthlyPlan) => ({ userId, productId: plan.id, credits: String(plan.creditsPerCycle) });

/** Returns the URL to send the user to (Stripe Checkout, or straight back in mock mode). */
export async function createCheckout(profile: Profile, productId: ProductId): Promise<string> {
  const product = productById(productId);
  if (!product) throw new Error("Unknown product");
  const success = `${env.appUrl()}/billing?success=1`;
  const cancel = `${env.appUrl()}/billing?canceled=1`;

  if (isMockStripe()) {
    // Mock Stripe: synthesise the same events Stripe would send and run them through the real handler.
    await handleStripeEvent(mockCheckoutEvent(profile, productId));
    if (product.kind === "monthly") await handleStripeEvent(mockInvoicePaidEvent(profile, "subscription_create", undefined, product.plan));
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
          line_items: [{ quantity: 1, price_data: planPrice(product.plan, await ensurePlanProduct(product.plan)) }],
          metadata: { userId: profile.id, productId },
          subscription_data: { metadata: planMetadata(profile.id, product.plan) },
        });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export type PlanChange = "upgrade" | "downgrade";

/**
 * Moves an existing subscriber to another plan. Every invoice is a full plan price for a full plan's credits,
 * so credits can never be bought below a plan's own rate:
 *  - upgrade: charged the new price now, the billing month restarts today, the new plan's credits arrive with
 *    that invoice (invoice.paid). Nothing is prorated or refunded; credits already granted stay.
 *  - downgrade: nothing is charged now; the next renewal bills the new price for the new plan's credits.
 */
export async function changePlan(profile: Profile, plan: MonthlyPlan): Promise<PlanChange> {
  const current = subscribedPlan(profile);
  if (!current) throw new Error("No active subscription");
  if (current.id === plan.id) throw new Error("Already on this plan");
  const change: PlanChange = plan.priceUsd > current.priceUsd ? "upgrade" : "downgrade";

  if (isMockStripe()) {
    if (change === "upgrade") await handleStripeEvent(mockInvoicePaidEvent(profile, "subscription_update", undefined, plan));
    else await db().updateProfile(profile.id, { subscription_plan: plan.id });
  } else {
    if (!profile.stripe_subscription_id) throw new Error("No Stripe subscription on file");
    const sub = await stripe().subscriptions.retrieve(profile.stripe_subscription_id);
    await stripe().subscriptions.update(sub.id, {
      items: [{ id: sub.items.data[0].id, price_data: planPrice(plan, await ensurePlanProduct(plan)) }],
      metadata: planMetadata(profile.id, plan),
      proration_behavior: "none",
      // error_if_incomplete: if the card is declined the call fails and the subscription is left as it was.
      ...(change === "upgrade" ? { billing_cycle_anchor: { type: "now" as const }, payment_behavior: "error_if_incomplete" as const } : {}),
    });
    // An upgrade's invoice.paid records the plan along with its credits; a downgrade has no invoice today.
    if (change === "downgrade") await db().updateProfile(profile.id, { subscription_plan: plan.id });
  }
  await track(profile.id, "plan_changed", { from: current.id, to: plan.id, change });
  return change;
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
        const plan = monthlyPlanById(s.metadata?.productId) ?? MONTHLY_PLAN;
        await db().updateProfile(userId, { plan: "monthly", stripe_subscription_id: subId, subscription_plan: plan.id });
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
        await track(userId, "purchase_completed", { product: s.metadata?.productId, credits, usd: (s.amount_total ?? 0) / 100 });
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
      // Which plan this invoice billed: its line's Stripe product first (what was actually charged), then the
      // subscription metadata (subscriptions created before plans had fixed products).
      const billed =
        (inv.lines?.data ?? []).map((l) => planByProductId(l.pricing?.price_details?.product)).find((p) => p) ??
        monthlyPlanById(meta.productId);
      const credits = billed?.creditsPerCycle ?? Number(meta.credits ?? MONTHLY_PLAN.creditsPerCycle);
      const r = await db().applyCredit({
        userId,
        delta: credits,
        reason: "subscription",
        stripeEventId: `in:${inv.id}`,
        meta: { event: event.id, productId: (billed ?? MONTHLY_PLAN).id, billing_reason: inv.billing_reason, amount_paid: inv.amount_paid },
      });
      await db().updateProfile(userId, {
        plan: "monthly",
        stripe_customer_id: customerId(inv.customer),
        stripe_subscription_id: customerId(details?.subscription as string | { id: string } | null),
        // Only a first delivery moves the plan: a late replay of an old invoice must not undo a later change.
        ...(r.applied ? { subscription_plan: (billed ?? MONTHLY_PLAN).id } : {}),
      });
      if (r.applied) {
        await onPurchaseCompleted(userId, `in:${inv.id}`);
        await track(userId, "purchase_completed", { product: (billed ?? MONTHLY_PLAN).id, credits, usd: inv.amount_paid / 100, billing_reason: inv.billing_reason });
      }
      return { handled: true, credited: r.applied ? credits : 0, duplicate: !r.applied };
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const p =
        (sub.metadata?.userId && (await db().getProfile(sub.metadata.userId))) ||
        (await db().getProfileByStripeCustomer(customerId(sub.customer) ?? ""));
      if (!p) return { handled: false };
      await db().updateProfile(p.id, { plan: "paid", stripe_subscription_id: null, subscription_plan: null });
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
        amount_total: (product.kind === "pack" ? product.pack.priceUsd : product.plan.priceUsd) * 100,
        metadata: {
          userId: profile.id,
          productId,
          ...(product.kind === "pack" ? { credits: String(product.pack.credits) } : {}),
        },
      },
    },
  } as unknown as Stripe.Event;
}

export function mockInvoicePaidEvent(
  profile: Profile,
  billingReason: string,
  invoiceId = `in_mock_${randomUUID()}`,
  plan: MonthlyPlan = MONTHLY_PLAN,
): Stripe.Event {
  return {
    id: `evt_mock_${randomUUID()}`,
    type: "invoice.paid",
    data: {
      object: {
        id: invoiceId,
        object: "invoice",
        billing_reason: billingReason,
        amount_paid: plan.priceUsd * 100,
        customer: profile.stripe_customer_id ?? `cus_mock_${profile.id.slice(0, 8)}`,
        lines: { data: [{ pricing: { type: "price_details", price_details: { product: planProductId(plan) } } }] },
        parent: {
          type: "subscription_details",
          subscription_details: {
            subscription: `sub_mock_${profile.id.slice(0, 8)}`,
            metadata: planMetadata(profile.id, plan),
          },
        },
      },
    },
  } as unknown as Stripe.Event;
}
