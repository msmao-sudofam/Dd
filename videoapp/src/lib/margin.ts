import type { Job, LedgerEntry, Model } from "@/lib/types";
import { CREDIT_FLOOR_USD } from "@/lib/pricing";

export interface MarginRow {
  key: string; // model slug, or `${day}|${slug}`
  day?: string;
  model: string;
  jobs: number;
  failed: number;
  creditsSpent: number; // net of refunds
  revenueUsd: number;
  costUsd: number;
  profitUsd: number;
  marginPct: number;
}

export interface MarginReport {
  cashInUsd: number;
  creditsSold: number;
  freeCreditsGranted: number;
  /** cash ÷ (sold + free) — what a spent credit is really worth, free credits included */
  effectiveCreditUsd: number;
  totals: MarginRow;
  byModel: MarginRow[];
  byDay: MarginRow[];
}

const centsOf = (l: LedgerEntry) => {
  const m = l.meta as { amount_total?: number; amount_paid?: number };
  return Number(m.amount_total ?? m.amount_paid ?? 0);
};

function finish(r: Omit<MarginRow, "profitUsd" | "marginPct">): MarginRow {
  const profitUsd = r.revenueUsd - r.costUsd;
  return { ...r, profitUsd, marginPct: r.revenueUsd > 0 ? profitUsd / r.revenueUsd : 0 };
}

/**
 * Revenue vs provider cost (BUILD_PLAN §4/Phase 5). Failed jobs earn nothing (credits refunded) but
 * their cost_usd still counts — providers may bill for failures.
 */
export function computeMargin(jobs: Job[], ledger: LedgerEntry[], models: Model[]): MarginReport {
  const paid = ledger.filter((l) => l.reason === "purchase" || l.reason === "subscription");
  const cashInUsd = paid.reduce((s, l) => s + centsOf(l), 0) / 100;
  const creditsSold = paid.reduce((s, l) => s + l.delta, 0);
  const freeCreditsGranted = ledger
    .filter((l) => l.reason === "signup_bonus" || l.reason === "referral" || (l.reason === "admin" && l.delta > 0))
    .reduce((s, l) => s + l.delta, 0);
  const denom = creditsSold + freeCreditsGranted;
  const effectiveCreditUsd = denom > 0 && cashInUsd > 0 ? cashInUsd / denom : CREDIT_FLOOR_USD;

  const slug = new Map(models.map((m) => [m.id, m.slug]));
  const acc = new Map<string, Omit<MarginRow, "profitUsd" | "marginPct">>();
  const bump = (key: string, model: string, day: string | undefined, j: Job) => {
    const r = acc.get(key) ?? { key, model, day, jobs: 0, failed: 0, creditsSpent: 0, revenueUsd: 0, costUsd: 0 };
    const failed = j.status === "failed" || j.status === "refunded";
    r.jobs += 1;
    if (failed) r.failed += 1;
    if (j.status === "succeeded" || j.status === "queued" || j.status === "running") {
      r.creditsSpent += j.credits_charged;
      r.revenueUsd += j.credits_charged * effectiveCreditUsd;
    }
    r.costUsd += j.cost_usd;
    acc.set(key, r);
  };
  const total = { key: "total", model: "All models", jobs: 0, failed: 0, creditsSpent: 0, revenueUsd: 0, costUsd: 0 };
  for (const j of jobs) {
    const s = slug.get(j.model_id) ?? "unknown";
    bump(s, s, undefined, j);
    const day = j.created_at.slice(0, 10);
    bump(`${day}|${s}`, s, day, j);
    const failed = j.status === "failed" || j.status === "refunded";
    total.jobs += 1;
    if (failed) total.failed += 1;
    if (!failed) {
      total.creditsSpent += j.credits_charged;
      total.revenueUsd += j.credits_charged * effectiveCreditUsd;
    }
    total.costUsd += j.cost_usd;
  }
  const rows = [...acc.values()].map(finish);
  return {
    cashInUsd,
    creditsSold,
    freeCreditsGranted,
    effectiveCreditUsd,
    totals: finish(total),
    byModel: rows.filter((r) => !r.day).sort((a, b) => b.profitUsd - a.profitUsd),
    byDay: rows.filter((r) => r.day).sort((a, b) => (b.day! + a.model).localeCompare(a.day! + b.model)),
  };
}
