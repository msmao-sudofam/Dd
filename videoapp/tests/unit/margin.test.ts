import { describe, expect, it } from "vitest";
import { computeMargin } from "@/lib/margin";
import type { Job, LedgerEntry, Model } from "@/lib/types";

const model = (id: string, slug: string) => ({ id, slug }) as Model;
const job = (o: Partial<Job>): Job => ({ model_id: "m1", status: "succeeded", credits_charged: 24, cost_usd: 0.36, created_at: "2026-10-10T10:00:00Z", ...o }) as Job;
const led = (o: Partial<LedgerEntry>): LedgerEntry => ({ meta: {}, ...o }) as LedgerEntry;

describe("computeMargin", () => {
  it("computes profit per model with failed jobs costing but not earning", () => {
    const r = computeMargin(
      [job({}), job({}), job({ status: "refunded" }), job({ model_id: "m2", credits_charged: 128, cost_usd: 3.2, created_at: "2026-10-11T10:00:00Z" })],
      [
        led({ reason: "purchase", delta: 1000, meta: { amount_total: 7900 } }),
        led({ reason: "signup_bonus", delta: 24 }),
      ],
      [model("m1", "ltx-fast"), model("m2", "veo-31")],
    );
    expect(r.cashInUsd).toBe(79);
    expect(r.effectiveCreditUsd).toBeCloseTo(79 / 1024);
    const fast = r.byModel.find((m) => m.model === "ltx-fast")!;
    expect(fast.jobs).toBe(3);
    expect(fast.failed).toBe(1);
    expect(fast.creditsSpent).toBe(48);
    expect(fast.costUsd).toBeCloseTo(1.08);
    expect(fast.revenueUsd).toBeCloseTo(48 * (79 / 1024));
    expect(r.byDay.map((d) => d.day)).toEqual(["2026-10-11", "2026-10-10"]);
    expect(r.totals.jobs).toBe(4);
  });

  it("falls back to the floor credit price with no sales", () => {
    const r = computeMargin([job({})], [], [model("m1", "x")]);
    expect(r.effectiveCreditUsd).toBeGreaterThan(0);
  });
});
