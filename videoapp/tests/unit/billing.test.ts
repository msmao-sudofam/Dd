import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import Stripe from "stripe";
import { createCheckout, handleStripeEvent, mockCheckoutEvent, mockInvoicePaidEvent } from "@/lib/billing";
import { mockCreateUser, mockDb } from "@/lib/db/mock";
import { MONTHLY_PLAN, SIGNUP_BONUS_CREDITS } from "@/lib/pricing";

process.env.MOCK_STRIPE = "true";
beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

async function user() {
  const u = await mockCreateUser(`b${Math.random()}@example.com`, "h");
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
