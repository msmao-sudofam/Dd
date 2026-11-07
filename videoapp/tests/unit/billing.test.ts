import { createUser } from "./helpers";
import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import Stripe from "stripe";
import { changePlan, createCheckout, handleStripeEvent, mockCheckoutEvent, mockInvoicePaidEvent } from "@/lib/billing";
import { mockDb } from "@/lib/db/mock";
import { MONTHLY_PLAN, MONTHLY_PLANS, SIGNUP_BONUS_CREDITS } from "@/lib/pricing";

process.env.MOCK_STRIPE = "true";
beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

async function user() {
  const u = await createUser(`b${Math.random()}@example.com`);
  return (await mockDb.getProfile(u.id))!;
}
const bal = async (id: string) => (await mockDb.getProfile(id))!.credits_balance;

describe("Stripe event handling", () => {
  it("credits a pack exactly once even if the webhook fires twice", async () => {
    const p = await user();
    const evt = mockCheckoutEvent(p, "starter");
    const a = await handleStripeEvent(evt);
    const b = await handleStripeEvent(evt);
    expect(a.credited).toBe(100);
    expect(b.duplicate).toBe(true);
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS + 100);
    expect((await mockDb.getProfile(p.id))!.plan).toBe("paid");
  });

  it("does not double-credit sibling events for the same checkout session", async () => {
    const p = await user();
    const first = mockCheckoutEvent(p, "creator", "cs_same");
    const sibling = { ...mockCheckoutEvent(p, "creator", "cs_same"), type: "checkout.session.async_payment_succeeded" } as Stripe.Event;
    await handleStripeEvent(first);
    await handleStripeEvent(sibling);
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS + 350);
  });

  it("waits for async payments before crediting", async () => {
    const p = await user();
    const evt = mockCheckoutEvent(p, "pro");
    (evt.data.object as Stripe.Checkout.Session).payment_status = "unpaid";
    await handleStripeEvent(evt);
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS);
  });

  it("grants monthly credits per invoice and flips the plan", async () => {
    const p = await user();
    await handleStripeEvent(mockCheckoutEvent(p, "monthly"));
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS); // subscription checkout itself grants nothing
    const inv1 = mockInvoicePaidEvent(p, "subscription_create", "in_1");
    await handleStripeEvent(inv1);
    await handleStripeEvent(inv1);
    await handleStripeEvent(mockInvoicePaidEvent(p, "subscription_cycle", "in_2"));
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS + 2 * MONTHLY_PLAN.creditsPerCycle);
    expect((await mockDb.getProfile(p.id))!.plan).toBe("monthly");

    await handleStripeEvent({
      id: "evt_del",
      type: "customer.subscription.deleted",
      data: { object: { customer: (await mockDb.getProfile(p.id))!.stripe_customer_id, metadata: {} } },
    } as unknown as Stripe.Event);
    expect((await mockDb.getProfile(p.id))!.plan).toBe("paid");
  });

  it("mock checkout credits instantly through the same handler", async () => {
    const p = await user();
    const url = await createCheckout(p, "starter");
    expect(url).toContain("/billing?success=1");
    expect(await bal(p.id)).toBe(SIGNUP_BONUS_CREDITS + 100);
  });
});

const [SOLO, GROWTH, STUDIO] = MONTHLY_PLANS;
const fresh = async (id: string) => (await mockDb.getProfile(id))!;

describe("monthly plan tiers", () => {
  it("subscribing to a bigger plan grants that plan's credits and records it", async () => {
    const p = await user();
    await createCheckout(p, GROWTH.id);
    const after = await fresh(p.id);
    expect(after.credits_balance).toBe(SIGNUP_BONUS_CREDITS + GROWTH.creditsPerCycle);
    expect(after.plan).toBe("monthly");
    expect(after.subscription_plan).toBe(GROWTH.id);
  });

  it("an invoice is credited by the plan it billed, not by stale subscription metadata", async () => {
    const p = await user();
    await createCheckout(p, SOLO.id);
    const inv = mockInvoicePaidEvent(await fresh(p.id), "subscription_update", "in_up", STUDIO);
    // Stripe snapshots metadata on the invoice; if that snapshot were still the old plan, the line's product decides.
    (inv.data.object as Stripe.Invoice).parent!.subscription_details!.metadata = { userId: p.id, productId: SOLO.id, credits: String(SOLO.creditsPerCycle) };
    const r = await handleStripeEvent(inv);
    expect(r.credited).toBe(STUDIO.creditsPerCycle);
    expect((await fresh(p.id)).subscription_plan).toBe(STUDIO.id);
  });

  it("falls back to the subscription metadata for invoices on a product it doesn't know", async () => {
    const p = await user();
    const inv = mockInvoicePaidEvent(p, "subscription_create", "in_legacy", GROWTH);
    (inv.data.object as unknown as { lines: unknown }).lines = { data: [{ pricing: { price_details: { product: "prod_legacy" } } }] };
    expect((await handleStripeEvent(inv)).credited).toBe(GROWTH.creditsPerCycle);
    const old = mockInvoicePaidEvent(p, "subscription_cycle", "in_older");
    delete (old.data.object as unknown as { lines?: unknown }).lines;
    expect((await handleStripeEvent(old)).credited).toBe(MONTHLY_PLAN.creditsPerCycle);
  });

  it("upgrade: charged as a full new invoice, new plan's credits added once, old credits kept", async () => {
    const p = await user();
    await createCheckout(p, SOLO.id);
    expect(await changePlan(await fresh(p.id), GROWTH)).toBe("upgrade");
    const after = await fresh(p.id);
    expect(after.subscription_plan).toBe(GROWTH.id);
    expect(after.credits_balance).toBe(SIGNUP_BONUS_CREDITS + SOLO.creditsPerCycle + GROWTH.creditsPerCycle);
    const paid = (await mockDb.listLedger(p.id, 50)).filter((l) => l.reason === "subscription");
    expect(paid.map((l) => (l.meta as { amount_paid: number }).amount_paid).sort((a, b) => a - b)).toEqual([SOLO.priceUsd * 100, GROWTH.priceUsd * 100]);
  });

  it("downgrade: nothing charged or credited now, the next renewal bills and credits the smaller plan", async () => {
    const p = await user();
    await createCheckout(p, STUDIO.id);
    const before = await bal(p.id);
    expect(await changePlan(await fresh(p.id), SOLO)).toBe("downgrade");
    expect(await bal(p.id)).toBe(before);
    expect((await fresh(p.id)).subscription_plan).toBe(SOLO.id);
    await handleStripeEvent(mockInvoicePaidEvent(await fresh(p.id), "subscription_cycle", "in_renew", SOLO));
    expect(await bal(p.id)).toBe(before + SOLO.creditsPerCycle);
  });

  it("a replayed old invoice does not undo a later plan change", async () => {
    const p = await user();
    const first = mockInvoicePaidEvent(p, "subscription_create", "in_first", STUDIO);
    await handleStripeEvent(mockCheckoutEvent(p, STUDIO.id));
    await handleStripeEvent(first);
    await changePlan(await fresh(p.id), SOLO);
    const replay = await handleStripeEvent(first);
    expect(replay.duplicate).toBe(true);
    expect((await fresh(p.id)).subscription_plan).toBe(SOLO.id);
  });

  it("refuses a change without a subscription or to the same plan, and clears the plan on cancel", async () => {
    const p = await user();
    await expect(changePlan(p, GROWTH)).rejects.toThrow("No active subscription");
    await createCheckout(p, GROWTH.id);
    await expect(changePlan(await fresh(p.id), GROWTH)).rejects.toThrow("Already on this plan");
    await handleStripeEvent({
      id: "evt_del2",
      type: "customer.subscription.deleted",
      data: { object: { customer: (await fresh(p.id)).stripe_customer_id, metadata: {} } },
    } as unknown as Stripe.Event);
    const after = await fresh(p.id);
    expect(after.plan).toBe("paid");
    expect(after.subscription_plan).toBeNull();
  });
});
