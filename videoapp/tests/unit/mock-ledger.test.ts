import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { mockCreateUser, mockDb } from "@/lib/db/mock";
import { InsufficientCreditsError } from "@/lib/db/types";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { readFileSync, readdirSync } from "node:fs";

beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

describe("mock DB ledger (mirrors apply_credit_delta)", () => {
  it("signup grants the bonus via the ledger", async () => {
    const u = await mockCreateUser("x@example.com", "h");
    const p = await mockDb.getProfile(u.id);
    expect(p?.credits_balance).toBe(SIGNUP_BONUS_CREDITS);
    const ledger = await mockDb.listLedger(u.id);
    expect(ledger.map((l) => l.reason)).toEqual(["signup_bonus"]);
  });

  it("rejects overdraft without writing a ledger row", async () => {
    const u = await mockCreateUser("y@example.com", "h");
    await expect(
      mockDb.applyCredit({ userId: u.id, delta: -(SIGNUP_BONUS_CREDITS + 1), reason: "admin" }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);
    expect(await mockDb.listLedger(u.id)).toHaveLength(1);
  });

  it("is idempotent on stripe event id and job+reason", async () => {
    const u = await mockCreateUser("z@example.com", "h");
    const a = await mockDb.applyCredit({ userId: u.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" });
    const b = await mockDb.applyCredit({ userId: u.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" });
    expect(a.applied).toBe(true);
    expect(b.applied).toBe(false);
    expect(b.balance).toBe(SIGNUP_BONUS_CREDITS + 100);
  });

  it("serializes concurrent debits so balance never goes negative", async () => {
    const u = await mockCreateUser("c@example.com", "h");
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) =>
        mockDb.applyCredit({ userId: u.id, delta: -5, reason: "generation", jobId: `job-${i}` }),
      ),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(Math.floor(SIGNUP_BONUS_CREDITS / 5));
    expect((await mockDb.getProfile(u.id))?.credits_balance).toBe(SIGNUP_BONUS_CREDITS % 5);
  });
});

describe("SQL and TS constants agree", () => {
  it("signup bonus in migrations matches SIGNUP_BONUS_CREDITS", () => {
    const sql = readdirSync("supabase/migrations")
      .sort()
      .map((f) => readFileSync(`supabase/migrations/${f}`, "utf8"))
      .join("\n");
    const matches = [...sql.matchAll(/apply_credit_delta\([^)]*?,\s*(\d+),\s*'signup_bonus'/g)].map((m) => Number(m[1]));
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.at(-1)).toBe(SIGNUP_BONUS_CREDITS);
  });
});
