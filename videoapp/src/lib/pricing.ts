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

export const MONTHLY_PLAN = {
  id: "monthly" as const,
  name: "Monthly",
  creditsPerCycle: 250,
  priceUsd: 19,
  blurb: "For brands posting every week",
};

/** Cheapest price a user can pay per credit — margin math always uses this worst case. */
export const CREDIT_FLOOR_USD = Math.min(
  ...CREDIT_PACKS.map((p) => p.priceUsd / p.credits),
  MONTHLY_PLAN.priceUsd / MONTHLY_PLAN.creditsPerCycle,
);

/** Markup over API cost: premium 3x, cheap tiers 4–5x (users don't notice, volume is there). */
export const MARKUP = { premium: 3, mid: 3.5, fast: 4.5 } as const;

/** Credits to charge so revenue ≥ markup × API cost even at the cheapest credit price. */
export function creditsForApiCost(apiCostUsd: number, tier: keyof typeof MARKUP): number {
  return Math.max(1, Math.ceil((apiCostUsd * MARKUP[tier]) / CREDIT_FLOOR_USD));
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
