// Credit economics (BUILD_PLAN §4). Every number that affects margin lives here.

export interface CreditPack {
  id: "starter" | "creator" | "pro";
  name: string;
  credits: number;
  priceUsd: number;
  blurb: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "Starter", credits: 100, priceUsd: 9, blurb: "Try a handful of presets" },
  { id: "creator", name: "Creator", credits: 350, priceUsd: 29, blurb: "A week of daily posts" },
  { id: "pro", name: "Pro", credits: 1000, priceUsd: 79, blurb: "For brands running ads" },
];

export interface MonthlyPlan {
  id: "monthly" | "monthly-growth" | "monthly-studio";
  name: string;
  creditsPerCycle: number;
  priceUsd: number;
  blurb: string;
}

/**
 * Monthly plans, cheapest first (subscriptions are the business goal). The first one is the entry plan:
 * its id stays "monthly" so existing subscriptions keep resolving. Bigger plans cost less per credit, which
 * is paid for out of margin, so each one has to pass MIN_MARGIN (tests/unit/pricing.test.ts).
 */
export const MONTHLY_PLANS: MonthlyPlan[] = [
  { id: "monthly", name: "Solo", creditsPerCycle: 250, priceUsd: 19, blurb: "For one brand posting every week" },
  { id: "monthly-growth", name: "Growth", creditsPerCycle: 700, priceUsd: 49, blurb: "For daily posts and ad tests" },
  { id: "monthly-studio", name: "Studio", creditsPerCycle: 1500, priceUsd: 99, blurb: "For agencies and several brands" },
];

/** The entry plan ("from $19 a month"). */
export const MONTHLY_PLAN = MONTHLY_PLANS[0];

export const perCreditUsd = (o: { priceUsd: number } & ({ credits: number } | { creditsPerCycle: number })) =>
  o.priceUsd / ("credits" in o ? o.credits : o.creditsPerCycle);

export function monthlyPlanById(id: string | null | undefined): MonthlyPlan | null {
  return MONTHLY_PLANS.find((p) => p.id === id) ?? null;
}

/** The plan a profile is subscribed to, or null. A subscriber with no recorded plan predates the tiers: entry plan. */
export function subscribedPlan(profile: { plan: string; subscription_plan?: string | null }): MonthlyPlan | null {
  if (profile.plan !== "monthly") return null;
  return monthlyPlanById(profile.subscription_plan) ?? MONTHLY_PLAN;
}

/**
 * The credit price that credit costs are set against: the cheapest pack or the entry plan. It does not move
 * when a bigger plan is added, so adding a plan never changes what a generation costs.
 */
export const CREDIT_BASIS_USD = Math.min(...CREDIT_PACKS.map(perCreditUsd), perCreditUsd(MONTHLY_PLAN));

/** Cheapest price anyone can pay per credit (the biggest plan) — worst-case margin is measured here. */
export const CREDIT_FLOOR_USD = Math.min(...CREDIT_PACKS.map(perCreditUsd), ...MONTHLY_PLANS.map(perCreditUsd));

/** Gross margin (before payment fees) every pack and plan must leave on every model, at its own credit price. */
export const MIN_MARGIN = 0.6;

/** Markup over API cost: premium 3x, cheap tiers 4–5x (users don't notice, volume is there). */
export const MARKUP = { premium: 3, mid: 3.5, fast: 4.5 } as const;

/** Credits to charge so revenue ≥ markup × API cost at the basis credit price (bigger plans trade some of it for volume). */
export function creditsForApiCost(apiCostUsd: number, tier: keyof typeof MARKUP): number {
  return Math.max(1, Math.ceil((apiCostUsd * MARKUP[tier]) / CREDIT_BASIS_USD));
}

/** Signup bonus ≈ one cheap generation. Keep in sync with handle_new_user() / claim_signup_bonus(). */
export const SIGNUP_BONUS_CREDITS = 24; // = one 6s "Fast" clip

/** Referral reward (both sides) after the referee's first purchase. */
export const REFERRAL_BONUS_CREDITS = 50;

/** Gross margin for one generation at a given realised credit price. */
export function grossMargin(credits: number, pricePerCreditUsd: number, apiCostUsd: number) {
  const revenue = credits * pricePerCreditUsd;
  return { revenue, profit: revenue - apiCostUsd, marginPct: revenue > 0 ? (revenue - apiCostUsd) / revenue : 0 };
}

/** Credit cost of a generation given the model and requested duration. */
export function creditCostFor(
  model: { credit_cost: number; credit_cost_per_second: number | null; default_duration: number | null },
  duration?: number | null,
): number {
  if (model.credit_cost_per_second && duration) return Math.ceil(model.credit_cost_per_second * duration);
  return model.credit_cost;
}

export function apiCostFor(
  model: { api_cost_usd: number; default_duration: number | null; credit_cost_per_second: number | null },
  duration?: number | null,
): number {
  if (model.credit_cost_per_second && duration && model.default_duration) {
    return (model.api_cost_usd / model.default_duration) * duration;
  }
  return model.api_cost_usd;
}
