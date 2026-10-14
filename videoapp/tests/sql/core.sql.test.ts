import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { asUser, createMigratedDb, pgAvailable } from "./helpers";

const available = await pgAvailable();
// CI sets REQUIRE_PG so a missing database fails loudly instead of silently skipping.
if (!available && process.env.REQUIRE_PG) throw new Error(`REQUIRE_PG set but Postgres is unreachable`);

describe.skipIf(!available)("core migration (local Postgres)", () => {
  let db: Client;
  let drop: () => Promise<void>;

  beforeAll(async () => {
    ({ client: db, drop } = await createMigratedDb());
  });
  afterAll(async () => drop?.());

  async function newUser(email: string): Promise<string> {
    const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
    // The app grants the welcome bonus after the fingerprint check (Phase 5).
    await db.query("select public.apply_credit_delta($1, 24, 'signup_bonus')", [rows[0].id]);
    return rows[0].id;
  }
  async function balance(id: string): Promise<number> {
    const { rows } = await db.query("select credits_balance from public.profiles where id = $1", [id]);
    return rows[0].credits_balance;
  }
  async function apply(id: string, delta: number, reason: string, job: string | null = null, evt: string | null = null) {
    const { rows } = await db.query("select * from public.apply_credit_delta($1, $2, $3, $4, $5)", [id, delta, reason, job, evt]);
    return rows[0] as { applied: boolean; balance: number };
  }

  it("signup trigger creates a profile with zero credits", async () => {
    const { rows: u } = await db.query("insert into auth.users (email) values ('fresh@example.com') returning id");
    const { rows: p } = await db.query("select credits_balance from public.profiles where id = $1", [u[0].id]);
    expect(p[0].credits_balance).toBe(0);
  });

  it("only one signup bonus per user", async () => {
    const id = await newUser("a@example.com");
    await apply(id, 24, "signup_bonus");
    const { rows } = await db.query("select * from public.credit_ledger where user_id = $1", [id]);
    expect(rows).toHaveLength(1);
    expect(rows[0].reason).toBe("signup_bonus");
    expect(await balance(id)).toBe(rows[0].delta);
    expect(rows[0].delta).toBeGreaterThan(0);
  });

  it("debits atomically and refuses to go negative", async () => {
    const id = await newUser("b@example.com");
    const start = await balance(id);
    await expect(apply(id, -(start + 1), "admin")).rejects.toThrow(/insufficient_credits/);
    expect(await balance(id)).toBe(start);
    const { rows } = await db.query("select count(*)::int as n from public.credit_ledger where user_id = $1", [id]);
    expect(rows[0].n).toBe(1); // failed debit left no ledger row
    const r = await apply(id, -start, "admin");
    expect(r).toEqual({ applied: true, balance: 0 });
  });

  it("is idempotent on stripe_event_id", async () => {
    const id = await newUser("c@example.com");
    const start = await balance(id);
    const a = await apply(id, 100, "purchase", null, "evt_1");
    const b = await apply(id, 100, "purchase", null, "evt_1");
    expect(a.applied).toBe(true);
    expect(b.applied).toBe(false);
    expect(await balance(id)).toBe(start + 100);
  });

  it("allows at most one refund per job", async () => {
    const id = await newUser("d@example.com");
    const { rows: m } = await db.query(
      "insert into public.models (slug, name, provider, provider_model_id, type, credit_cost) values ('t-model','T','mock','x','t2v',5) returning id",
    );
    const { rows: j } = await db.query(
      "insert into public.jobs (user_id, model_id, provider) values ($1, $2, 'mock') returning id",
      [id, m[0].id],
    );
    const start = await balance(id);
    await apply(id, -5, "generation", j[0].id);
    await apply(id, -5, "generation", j[0].id); // duplicate debit ignored
    expect(await balance(id)).toBe(start - 5);
    await apply(id, 5, "refund", j[0].id);
    await apply(id, 5, "refund", j[0].id); // duplicate refund ignored
    expect(await balance(id)).toBe(start);
  });

  it("record_signup_fingerprint counts other accounts on the same device", async () => {
    const a = await newUser("fp-a@example.com");
    const b = await newUser("fp-b@example.com");
    const q = async (u: string) =>
      (await db.query("select public.record_signup_fingerprint($1, 'dev:abc') as n", [u])).rows[0].n;
    expect(await q(a)).toBe(0);
    expect(await q(a)).toBe(0); // same user again
    expect(await q(b)).toBe(1);
  });

  it("RLS: users only read their own rows and cannot write balances", async () => {
    const a = await newUser("rls-a@example.com");
    const b = await newUser("rls-b@example.com");
    await asUser(db, a, async () => {
      const { rows } = await db.query("select id from public.profiles");
      expect(rows.map((r) => r.id)).toEqual([a]);
      const { rows: ledger } = await db.query("select user_id from public.credit_ledger");
      expect(new Set(ledger.map((r) => r.user_id))).toEqual(new Set([a]));
    });
    await asUser(db, a, async () => {
      await expect(db.query("update public.profiles set credits_balance = 999999 where id = $1", [a])).rejects.toThrow(
        /permission denied/,
      );
    });
    await asUser(db, a, async () => {
      await expect(db.query("select public.apply_credit_delta($1, 1000, 'admin')", [b])).rejects.toThrow(
        /permission denied/,
      );
    });
  });
});

describe.skipIf(!available)("UGC tables (local Postgres)", () => {
  let db: Client;
  let drop: () => Promise<void>;
  beforeAll(async () => {
    ({ client: db, drop } = await createMigratedDb());
  });
  afterAll(async () => drop?.());

  it("library creators are visible to everyone, own-face creators only to their owner", async () => {
    const { rows: a } = await db.query("insert into auth.users (email) values ('ugc-a@example.com') returning id");
    const { rows: b } = await db.query("insert into auth.users (email) values ('ugc-b@example.com') returning id");
    await db.query(
      "insert into public.ugc_actors (slug, name, voice, owner_id, upload_path) values ('me-a', 'A', 'Sarah', $1, $2)",
      [a[0].id, `${a[0].id}/selfie.jpg`],
    );
    const lib = (await db.query("select count(*)::int as n from public.ugc_actors where owner_id is null")).rows[0].n;
    expect(lib).toBe(8); // seeded
    await asUser(db, b[0].id, async () => {
      const { rows } = await db.query("select slug from public.ugc_actors");
      expect(rows.map((r) => r.slug)).not.toContain("me-a");
      expect(rows).toHaveLength(8);
    });
    await asUser(db, a[0].id, async () => {
      const { rows } = await db.query("select slug from public.ugc_actors");
      expect(rows.map((r) => r.slug)).toContain("me-a");
    });
  });

  it("own-face creators must reference an upload, and jobs accept the ugc kind", async () => {
    const { rows: u } = await db.query("insert into auth.users (email) values ('ugc-c@example.com') returning id");
    await expect(
      db.query("insert into public.ugc_actors (slug, name, voice, owner_id) values ('bad', 'x', 'Sarah', $1)", [u[0].id]),
    ).rejects.toThrow(/check/);
    const { rows: m } = await db.query("select id from public.models where slug = 'ugc-studio'");
    await db.query("insert into public.jobs (user_id, model_id, provider, kind, stage) values ($1, $2, 'fal', 'ugc', 'voice')", [
      u[0].id,
      m[0].id,
    ]);
  });
});
