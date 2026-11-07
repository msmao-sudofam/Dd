import { expect, test } from "@playwright/test";
import Stripe from "stripe";
import { MONTHLY_PLANS, SIGNUP_BONUS_CREDITS } from "../../src/lib/pricing";
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

const [SOLO, GROWTH, STUDIO] = MONTHLY_PLANS;

test("pricing shows the three monthly plans first, with the saving each bigger plan really gives", async ({ page }) => {
  await page.goto("/pricing");
  const cards = page.getByTestId("pricing-cards");
  for (const p of MONTHLY_PLANS) {
    const card = cards.getByTestId(`plan-${p.id}`);
    await expect(card).toContainText(`$${p.priceUsd}`);
    await expect(card).toContainText(`${p.creditsPerCycle.toLocaleString("en-US")} credits every month`);
  }
  await expect(cards.getByTestId(`saving-${SOLO.id}`)).toHaveCount(0);
  const pct = (p: (typeof MONTHLY_PLANS)[number]) => Math.round((1 - p.priceUsd / p.creditsPerCycle / (SOLO.priceUsd / SOLO.creditsPerCycle)) * 100);
  await expect(cards.getByTestId(`saving-${GROWTH.id}`)).toHaveText(`Save ${pct(GROWTH)}% per credit`);
  await expect(cards.getByTestId(`saving-${STUDIO.id}`)).toHaveText(`Save ${pct(STUDIO)}% per credit`);
  // Plans come before packs in the page.
  const planY = (await cards.getByTestId(`plan-${STUDIO.id}`).boundingBox())!.y;
  const packY = (await cards.getByTestId("pack-starter").boundingBox())!.y;
  expect(planY).toBeLessThan(packY);
});

test("subscribe, upgrade with a confirm step, then switch down without a charge", async ({ page }) => {
  await signUp(page);
  await page.goto("/billing");
  await page.getByTestId(`buy-${GROWTH.id}`).click();
  await expect(page.getByTestId("purchase-success")).toBeVisible();
  await expect(page.getByTestId("billing-plan")).toHaveText(GROWTH.name);
  await expect(page.getByTestId("billing-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS + GROWTH.creditsPerCycle));
  await expect(page.getByTestId(`plan-${GROWTH.id}`).getByTestId("current-plan")).toBeVisible();

  // Upgrade: picking the plan only opens the confirm step; nothing changes until it is confirmed.
  await page.getByTestId(`buy-${STUDIO.id}`).click();
  const confirm = page.getByTestId("plan-change-confirm");
  await expect(confirm).toContainText(`You'll be charged $${STUDIO.priceUsd} now`);
  await expect(page.getByTestId("billing-plan")).toHaveText(GROWTH.name);
  await expect(page.getByTestId("billing-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS + GROWTH.creditsPerCycle));
  await page.getByTestId("confirm-plan-change").click();
  await expect(page.getByTestId("purchase-success")).toBeVisible();
  await expect(page.getByTestId("billing-plan")).toHaveText(STUDIO.name);
  const afterUpgrade = SIGNUP_BONUS_CREDITS + GROWTH.creditsPerCycle + STUDIO.creditsPerCycle;
  await expect(page.getByTestId("billing-balance")).toHaveText(String(afterUpgrade));

  // Switch down: no charge, no credits, plan recorded for the next renewal.
  await page.getByTestId(`buy-${SOLO.id}`).click();
  await expect(page.getByTestId("plan-change-confirm")).toContainText("Nothing is charged now");
  await page.getByTestId("confirm-plan-change").click();
  await expect(page.getByTestId("plan-changed")).toContainText(`Your plan is now ${SOLO.name}`);
  await expect(page.getByTestId("billing-plan")).toHaveText(SOLO.name);
  await expect(page.getByTestId("billing-balance")).toHaveText(String(afterUpgrade));
  await expect(page.locator('[data-testid="ledger"] tr[data-reason="subscription"]')).toHaveCount(2);
});
