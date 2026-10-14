import { createUser } from "./helpers";
import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDb } from "@/lib/db/mock";
import { InsufficientCreditsError } from "@/lib/db/types";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { readFileSync, readdirSync } from "node:fs";

beforeEach(() => rmSync(".data-test", { recursive: true, force: true }));

describe("mock DB ledger (mirrors apply_credit_delta)", () => {
  it("signup bonus goes through the ledger", async () => {
    const u = await createUser("x@example.com");
    const p = await mockDb.getProfile(u.id);
    expect(p?.credits_balance).toBe(SIGNUP_BONUS_CREDITS);
    const ledger = await mockDb.listLedger(u.id);
    expect(ledger.map((l) => l.reason)).toEqual(["signup_bonus"]);
  });

  it("rejects overdraft without writing a ledger row", async () => {
    const u = await createUser("y@example.com");
    await expect(
      mockDb.applyCredit({ userId: u.id, delta: -(SIGNUP_BONUS_CREDITS + 1), reason: "admin" }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);
    expect(await mockDb.listLedger(u.id)).toHaveLength(1);
  });

  it("is idempotent on stripe event id and job+reason", async () => {
    const u = await createUser("z@example.com");
    const a = await mockDb.applyCredit({ userId: u.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" });
    const b = await mockDb.applyCredit({ userId: u.id, delta: 100, reason: "purchase", stripeEventId: "evt_1" });
    expect(a.applied).toBe(true);
    expect(b.applied).toBe(false);
    expect(b.balance).toBe(SIGNUP_BONUS_CREDITS + 100);
  });

  it("serializes concurrent debits so balance never goes negative", async () => {
    const u = await createUser("c@example.com");
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

describe("signup bonus", () => {
  it("trigger no longer grants the bonus; the server does (after the fingerprint check)", () => {
    const sql = readdirSync("supabase/migrations")
      .sort()
      .map((f) => readFileSync(`supabase/migrations/${f}`, "utf8"))
      .join("\n");
    const lastTrigger = sql.slice(sql.lastIndexOf("function public.handle_new_user()"));
    expect(lastTrigger.slice(0, lastTrigger.indexOf("$$;", lastTrigger.indexOf("$$") + 2))).not.toContain("signup_bonus");
  });
});
