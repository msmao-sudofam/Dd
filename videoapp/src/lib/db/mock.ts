import "server-only";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import { SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { SEED_MODELS, SEED_PRESETS } from "@/lib/seed-data";
import type { Job, LedgerEntry, Model, Preset, Profile } from "@/lib/types";
import {
  InsufficientCreditsError,
  type ApplyCreditArgs,
  type Db,
  type JobPatch,
  type ModelInput,
  type NewJob,
  type PresetInput,
} from "./types";

export interface MockUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface Store {
  users: MockUser[];
  profiles: Profile[];
  ledger: LedgerEntry[];
  models: Model[];
  presets: Preset[];
  jobs: Job[];
  fingerprints: { user_id: string; fingerprint: string; created_at: string }[];
  moderation?: Record<string, unknown>[];
  stripeEvents?: string[];
  consents?: Record<string, unknown>[];
  ledgerSeq: number;
}

const now = () => new Date().toISOString();

function dbPath() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.mockDbPath());
}

export function storageDir() {
  return path.join(path.dirname(dbPath()), "storage");
}

function seedStore(): Store {
  const models: Model[] = SEED_MODELS.map((m) => ({ ...m, id: randomUUID(), created_at: now() }));
  const bySlug = new Map(models.map((m) => [m.slug, m.id]));
  const presets: Preset[] = SEED_PRESETS.map(({ model_slug, ...p }) => ({
    ...p,
    model_id: bySlug.get(model_slug)!,
    id: randomUUID(),
    created_at: now(),
  }));
  return { users: [], profiles: [], ledger: [], models, presets, jobs: [], fingerprints: [], ledgerSeq: 0 };
}

function load(): Store {
  const p = dbPath();
  if (!existsSync(p)) {
    const s = seedStore();
    save(s);
    return s;
  }
  return JSON.parse(readFileSync(p, "utf8")) as Store;
}

function save(s: Store) {
  const p = dbPath();
  mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(s, null, 1));
  renameSync(tmp, p);
}

// Serialize every read-modify-write so concurrent requests can't race (single Node process).
let chain: Promise<unknown> = Promise.resolve();
function tx<T>(fn: (s: Store) => T): Promise<T> {
  const run = chain.then(() => {
    const s = load();
    const out = fn(s);
    save(s);
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}
function read<T>(fn: (s: Store) => T): Promise<T> {
  const run = chain.then(() => fn(load()));
  chain = run.catch(() => undefined);
  return run;
}

const clone = <T>(v: T): T => structuredClone(v);

/** Mirrors public.apply_credit_delta() in SQL. Must be called inside tx(). */
function applyCreditIn(s: Store, a: ApplyCreditArgs) {
  const profile = s.profiles.find((p) => p.id === a.userId);
  if (!profile) throw new Error("profile_not_found");
  const dup = s.ledger.some(
    (l) =>
      (a.stripeEventId && l.stripe_event_id === a.stripeEventId) ||
      (a.jobId && l.job_id === a.jobId && l.reason === a.reason) ||
      (a.reason === "signup_bonus" && l.user_id === a.userId && l.reason === "signup_bonus"),
  );
  if (dup) return { applied: false, balance: profile.credits_balance };
  if (profile.credits_balance + a.delta < 0) throw new InsufficientCreditsError();
  profile.credits_balance += a.delta;
  s.ledger.push({
    id: ++s.ledgerSeq,
    user_id: a.userId,
    delta: a.delta,
    reason: a.reason,
    job_id: a.jobId ?? null,
    stripe_event_id: a.stripeEventId ?? null,
    meta: a.meta ?? {},
    created_at: now(),
  });
  return { applied: true, balance: profile.credits_balance };
}

// ---------------------------------------------------------------------------
// Mock auth users (stand-in for Supabase auth.users)
// ---------------------------------------------------------------------------

export function mockFindUserByEmail(email: string): Promise<MockUser | null> {
  return read((s) => clone(s.users.find((u) => u.email === email.toLowerCase()) ?? null));
}

/** Creates the user and runs the equivalent of the on_auth_user_created trigger. */
export function mockCreateUser(email: string, passwordHash: string): Promise<MockUser> {
  return tx((s) => {
    const e = email.toLowerCase();
    if (s.users.some((u) => u.email === e)) throw new Error("user_exists");
    const user: MockUser = { id: randomUUID(), email: e, password_hash: passwordHash, created_at: now() };
    s.users.push(user);
    s.profiles.push({
      id: user.id,
      email: e,
      credits_balance: 0,
      plan: "free",
      role: "user",
      referral_code: randomBytes(4).toString("hex"),
      referred_by: null,
      created_at: now(),
    });
    applyCreditIn(s, { userId: user.id, delta: SIGNUP_BONUS_CREDITS, reason: "signup_bonus" });
    return clone(user);
  });
}

export function mockSignObjectPath(bucket: string, p: string, exp: number) {
  return createHmac("sha256", env.sessionSecret()).update(`${bucket}/${p}:${exp}`).digest("hex").slice(0, 32);
}

// ---------------------------------------------------------------------------

export const mockDb: Db = {
  getProfile: (id) => read((s) => clone(s.profiles.find((p) => p.id === id) ?? null)),
  getProfileByReferralCode: (code) => read((s) => clone(s.profiles.find((p) => p.referral_code === code) ?? null)),
  updateProfile: (id, patch) =>
    tx((s) => {
      const p = s.profiles.find((x) => x.id === id);
      if (p) Object.assign(p, patch);
    }),
  getProfileByStripeCustomer: (c) => read((s) => clone(s.profiles.find((p) => p.stripe_customer_id === c) ?? null)),
  recordStripeEvent: (id) =>
    tx((s) => {
      s.stripeEvents ??= [];
      if (s.stripeEvents.includes(id)) return false;
      s.stripeEvents.push(id);
      return true;
    }),
  listProfiles: (limit = 200) =>
    read((s) => clone([...s.profiles].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit))),

  applyCredit: (a) => tx((s) => applyCreditIn(s, a)),
  listLedger: (userId, limit = 50) =>
    read((s) =>
      clone(
        s.ledger
          .filter((l) => l.user_id === userId)
          .sort((a, b) => b.id - a.id)
          .slice(0, limit),
      ),
    ),
  hasLedgerReason: (userId, reason) => read((s) => s.ledger.some((l) => l.user_id === userId && l.reason === reason)),
  listLedgerSince: (since, reasons) =>
    read((s) => clone(s.ledger.filter((l) => l.created_at >= since && reasons.includes(l.reason)))),

  listModels: (opts) =>
    read((s) =>
      clone(s.models.filter((m) => opts?.includeDisabled || m.enabled).sort((a, b) => a.sort_order - b.sort_order)),
    ),
  getModel: (k) => read((s) => clone(s.models.find((m) => m.id === k || m.slug === k) ?? null)),
  upsertModel: (m: ModelInput) =>
    tx((s) => {
      const existing = s.models.find((x) => (m.id && x.id === m.id) || x.slug === m.slug);
      if (existing) {
        Object.assign(existing, m, { id: existing.id });
        return clone(existing);
      }
      const row: Model = { ...m, id: m.id ?? randomUUID(), created_at: now() };
      s.models.push(row);
      return clone(row);
    }),

  listPresets: (opts) =>
    read((s) =>
      clone(s.presets.filter((p) => opts?.includeDisabled || p.enabled).sort((a, b) => a.sort_order - b.sort_order)),
    ),
  getPreset: (k) => read((s) => clone(s.presets.find((p) => p.id === k || p.slug === k) ?? null)),
  upsertPreset: (p: PresetInput) =>
    tx((s) => {
      const existing = s.presets.find((x) => (p.id && x.id === p.id) || x.slug === p.slug);
      if (existing) {
        Object.assign(existing, p, { id: existing.id });
        return clone(existing);
      }
      const row: Preset = { ...p, id: p.id ?? randomUUID(), created_at: now() };
      s.presets.push(row);
      return clone(row);
    }),
  deletePreset: (id) =>
    tx((s) => {
      s.presets = s.presets.filter((p) => p.id !== id);
    }),

  createJob: (j: NewJob) =>
    tx((s) => {
      const row: Job = {
        preset_id: null,
        credits_charged: 0,
        cost_usd: 0,
        status: "queued",
        ...j,
        id: randomUUID(),
        provider_request_id: null,
        output_url: null,
        error: null,
        created_at: now(),
        completed_at: null,
      };
      s.jobs.push(row);
      return clone(row);
    }),
  updateJob: (id, patch: JobPatch) =>
    tx((s) => {
      const j = s.jobs.find((x) => x.id === id);
      if (!j) throw new Error("job_not_found");
      Object.assign(j, patch);
      return clone(j);
    }),
  transitionJob: (id, from, patch) =>
    tx((s) => {
      const j = s.jobs.find((x) => x.id === id);
      if (!j || !from.includes(j.status)) return null;
      Object.assign(j, patch);
      return clone(j);
    }),
  getJob: (id) => read((s) => clone(s.jobs.find((j) => j.id === id) ?? null)),
  findJobByProviderRequest: (provider, reqId) =>
    read((s) => clone(s.jobs.find((j) => j.provider === provider && j.provider_request_id === reqId) ?? null)),
  listJobs: (userId, limit = 60) =>
    read((s) =>
      clone(
        s.jobs
          .filter((j) => j.user_id === userId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, limit),
      ),
    ),
  listJobsSince: (since) => read((s) => clone(s.jobs.filter((j) => j.created_at >= since))),
  countJobsSince: (userId, since) =>
    read((s) => s.jobs.filter((j) => j.user_id === userId && j.created_at >= since).length),

  logModeration: (e) =>
    tx((s) => {
      (s.moderation ??= []).push({ ...e, created_at: now() });
    }),
  logConsent: (e) =>
    tx((s) => {
      (s.consents ??= []).push({ ...e, created_at: now() });
    }),

  recordSignupFingerprint: (userId, fingerprint) =>
    tx((s) => {
      const prior = s.fingerprints.filter((f) => f.fingerprint === fingerprint && f.user_id !== userId).length;
      if (!s.fingerprints.some((f) => f.user_id === userId && f.fingerprint === fingerprint)) {
        s.fingerprints.push({ user_id: userId, fingerprint, created_at: now() });
      }
      return prior;
    }),

  uploadObject: async (bucket, p, body) => {
    const file = path.join(storageDir(), bucket, p);
    if (!file.startsWith(path.join(storageDir(), bucket))) throw new Error("bad_path");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, body);
  },
  objectUrl: async (bucket, p, expiresIn = 3600) => {
    const base = `${env.appUrl()}/api/storage/${bucket}/${p}`;
    if (bucket === "outputs") return base;
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    return `${base}?exp=${exp}&sig=${mockSignObjectPath(bucket, p, exp)}`;
  },
};
