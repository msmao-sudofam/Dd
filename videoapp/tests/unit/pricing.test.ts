import { describe, expect, it } from "vitest";
import {
  CREDIT_BASIS_USD,
  CREDIT_FLOOR_USD,
  CREDIT_PACKS,
  MARKUP,
  MIN_MARGIN,
  MONTHLY_PLAN,
  MONTHLY_PLANS,
  apiCostFor,
  creditCostFor,
  perCreditUsd,
  subscribedPlan,
} from "@/lib/pricing";
import { SEED_MODELS } from "@/lib/seed-data";
import { estimateUgcCost } from "@/lib/ugc/config";

const OFFERS = [
  ...CREDIT_PACKS.map((p) => ({ label: `pack ${p.name}`, rate: perCreditUsd(p) })),
  ...MONTHLY_PLANS.map((p) => ({ label: `plan ${p.name}`, rate: perCreditUsd(p) })),
];

describe("monthly plans", () => {
  it("are ordered by price, and each bigger plan costs less per credit", () => {
    for (let i = 1; i < MONTHLY_PLANS.length; i++) {
      expect(MONTHLY_PLANS[i].priceUsd).toBeGreaterThan(MONTHLY_PLANS[i - 1].priceUsd);
      expect(perCreditUsd(MONTHLY_PLANS[i])).toBeLessThan(perCreditUsd(MONTHLY_PLANS[i - 1]));
    }
  });

  it("keeps the entry plan as the product id existing subscriptions carry", () => {
    expect(MONTHLY_PLAN.id).toBe("monthly");
    expect(MONTHLY_PLANS[0]).toBe(MONTHLY_PLAN);
  });

  it("never beats a subscription with a pack: every plan is cheaper per credit than every pack", () => {
    for (const plan of MONTHLY_PLANS) for (const pack of CREDIT_PACKS) expect(perCreditUsd(plan)).toBeLessThan(perCreditUsd(pack));
  });

  it("adding bigger plans does not move the basis credit costs are set against", () => {
    expect(CREDIT_BASIS_USD).toBeCloseTo(perCreditUsd(MONTHLY_PLAN));
    expect(CREDIT_FLOOR_USD).toBeCloseTo(perCreditUsd(MONTHLY_PLANS[MONTHLY_PLANS.length - 1]));
    expect(CREDIT_FLOOR_USD).toBeLessThanOrEqual(CREDIT_BASIS_USD);
  });

  it("resolves a profile's plan, treating a subscriber with no recorded plan as the entry plan", () => {
    expect(subscribedPlan({ plan: "free" })).toBeNull();
    expect(subscribedPlan({ plan: "paid", subscription_plan: "monthly-growth" })).toBeNull();
    expect(subscribedPlan({ plan: "monthly" })).toBe(MONTHLY_PLAN);
    expect(subscribedPlan({ plan: "monthly", subscription_plan: "monthly-studio" })!.name).toBe("Studio");
  });
});

// The margin check: whatever a customer buys, every generation they can spend it on leaves MIN_MARGIN.
describe("margin at every pack and plan", () => {
  for (const offer of OFFERS) {
    it(`${offer.label} ($${offer.rate.toFixed(4)}/credit) leaves at least ${MIN_MARGIN * 100}% on every model`, () => {
      for (const m of SEED_MODELS.filter((x) => x.api_cost_usd > 0)) {
        for (const d of m.allowed_durations.length ? m.allowed_durations : [m.default_duration]) {
          const revenue = creditCostFor(m, d) * offer.rate;
          const margin = (revenue - apiCostFor(m, d)) / revenue;
          expect(margin, `${m.slug} at ${d}s`).toBeGreaterThanOrEqual(MIN_MARGIN);
        }
      }
    });

    it(`${offer.label} leaves at least ${MIN_MARGIN * 100}% on UGC ads`, () => {
      const scripts = ["Short hook. Buy now.", "word ".repeat(60).trim(), "word ".repeat(110).trim()];
      for (const text of scripts)
        for (const quality of ["standard", "premium"] as const)
          for (const broll of [false, true]) {
            const c = estimateUgcCost(text, { quality, broll, hasProductImage: true });
            const revenue = c.credits * offer.rate;
            expect((revenue - c.usd) / revenue, `${quality} broll=${broll} ${c.seconds}s`).toBeGreaterThanOrEqual(MIN_MARGIN);
          }
    });
  }

  it("the smallest markup still clears the target at the cheapest credit price", () => {
    const worstMarkup = Math.min(...Object.values(MARKUP)) * (CREDIT_FLOOR_USD / CREDIT_BASIS_USD);
    expect(1 - 1 / worstMarkup).toBeGreaterThanOrEqual(MIN_MARGIN);
  });
});
