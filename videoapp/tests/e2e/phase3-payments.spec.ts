import { expect, test } from "@playwright/test";
import Stripe from "stripe";
import { SIGNUP_BONUS_CREDITS } from "../../src/lib/pricing";
import { balance, signUp } from "./helpers";

const WEBHOOK_SECRET = "whsec_e2e_test_secret";
const stripe = new Stripe("sk_test_dummy");

// Phase 3 "Done when": a test card purchase adds credits exactly once, even if the webhook fires twice.
test("purchase adds credits exactly once even when the webhook is delivered twice", async ({ page, request }) => {
  await signUp(page);
  await page.goto("/billing");
  await page.getByTestId("buy-starter").click();
  await expect(page.getByTestId("purchase-success")).toBeVisible();
  await expect(page.getByTestId("billing-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS + 100));

  // Now simulate Stripe delivering a (real-format, signed) checkout.session.completed twice.
  const userId = await page.evaluate(async () => {
    const res = await fetch("/api/me");
    return (await res.json()).id as string;
  });
  const payload = JSON.stringify({
    id: "evt_e2e_1",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        object: "checkout.session",
        mode: "payment",
        payment_status: "paid",
        client_reference_id: userId,
        customer: "cus_test_123",
        amount_total: 2900,
        metadata: { userId, productId: "creator", credits: "350" },
      },
    },
  });
  for (let i = 0; i < 2; i++) {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    const res = await request.post("/api/webhooks/stripe", {
      headers: { "stripe-signature": header, "content-type": "application/json" },
      data: payload,
    });
    expect(res.status()).toBe(200);
  }
  const bad = await request.post("/api/webhooks/stripe", {
    headers: { "stripe-signature": "t=1,v1=deadbeef", "content-type": "application/json" },
    data: payload,
  });
  expect(bad.status()).toBe(400);

  await page.reload();
  expect(await balance(page)).toBe(SIGNUP_BONUS_CREDITS + 100 + 350);
  await expect(page.locator('[data-testid="ledger"] tr[data-reason="purchase"]')).toHaveCount(2);
});
