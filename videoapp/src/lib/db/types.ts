import type { Job, LedgerEntry, LedgerReason, Model, Preset, Profile, ProviderName, UgcActor, UgcProject } from "@/lib/types";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("insufficient_credits");
    this.name = "InsufficientCreditsError";
  }
}

export interface ApplyCreditArgs {
  userId: string;
  delta: number;
  reason: LedgerReason;
  jobId?: string | null;
  stripeEventId?: string | null;
  meta?: Record<string, unknown>;
}

export interface ApplyCreditResult {
  /** false when the ledger row already existed (idempotent replay) */
  applied: boolean;
  balance: number;
}

export type NewJob = Pick<Job, "user_id" | "model_id" | "input_json" | "provider" | "output_type"> &
  Partial<Pick<Job, "preset_id" | "credits_charged" | "cost_usd" | "status" | "kind" | "stage" | "stage_data">>;

export type JobPatch = Partial<
  Pick<
    Job,
    | "status"
    | "provider"
    | "provider_request_id"
    | "output_url"
    | "error"
    | "completed_at"
    | "cost_usd"
    | "credits_charged"
    | "stage"
    | "stage_data"
  >
>;

export type NewUgcActor = Omit<UgcActor, "id" | "created_at">;
export type NewUgcProject = Omit<UgcProject, "id" | "created_at">;

export type ModelInput = Omit<Model, "id" | "created_at"> & { id?: string };
export type PresetInput = Omit<Preset, "id" | "created_at"> & { id?: string };

export interface DailyMarginRow {
  day: string; // YYYY-MM-DD
  model_slug: string;
  jobs: number;
  failed: number;
  credits: number;
  revenue_usd: number;
  cost_usd: number;
}

/** Server-only data access. Two implementations: Supabase (service role) and a file-backed mock. */
export interface Db {
  getProfile(id: string): Promise<Profile | null>;
  getProfileByReferralCode(code: string): Promise<Profile | null>;
  updateProfile(
    id: string,
    patch: Partial<Pick<Profile, "plan" | "role" | "referred_by" | "stripe_customer_id" | "stripe_subscription_id">>,
  ): Promise<void>;
  getProfileByStripeCustomer(customerId: string): Promise<Profile | null>;
  /** Returns false if this Stripe event id was already recorded. */
  recordStripeEvent(id: string, type: string): Promise<boolean>;
  listProfiles(limit?: number): Promise<Profile[]>;

  applyCredit(args: ApplyCreditArgs): Promise<ApplyCreditResult>;
  listLedger(userId: string, limit?: number): Promise<LedgerEntry[]>;
  hasLedgerReason(userId: string, reason: LedgerReason): Promise<boolean>;
  listLedgerSince(sinceIso: string, reasons: LedgerReason[]): Promise<LedgerEntry[]>;

  listModels(opts?: { includeDisabled?: boolean }): Promise<Model[]>;
  getModel(idOrSlug: string): Promise<Model | null>;
  upsertModel(m: ModelInput): Promise<Model>;

  listPresets(opts?: { includeDisabled?: boolean }): Promise<Preset[]>;
  getPreset(idOrSlug: string): Promise<Preset | null>;
  upsertPreset(p: PresetInput): Promise<Preset>;
  deletePreset(id: string): Promise<void>;

  createJob(j: NewJob): Promise<Job>;
  updateJob(id: string, patch: JobPatch): Promise<Job>;
  /** Conditional update: only applies if the job's status is in `from`. Returns null if it wasn't. */
  transitionJob(id: string, from: Job["status"][], patch: JobPatch): Promise<Job | null>;
  /** Conditional update keyed on the current provider_request_id (pipeline stage claim). Null if it changed. */
  claimJobRequest(id: string, expectedRequestId: string, patch: JobPatch): Promise<Job | null>;
  getJob(id: string): Promise<Job | null>;
  findJobByProviderRequest(provider: ProviderName, requestId: string): Promise<Job | null>;
  listJobs(userId: string, limit?: number): Promise<Job[]>;
  listJobsSince(sinceIso: string): Promise<Job[]>;
  countJobsSince(userId: string, sinceIso: string): Promise<number>;

  logModeration(e: { userId: string | null; kind: "text" | "image"; excerpt: string; reasons: string[]; source: "local" | "openai" }): Promise<void>;
  logConsent(e: { userId: string; uploadPath: string; statement: string; ip: string | null; userAgent: string | null }): Promise<void>;

  listUgcActors(userId: string | null): Promise<UgcActor[]>;
  getUgcActor(id: string): Promise<UgcActor | null>;
  createUgcActor(a: NewUgcActor): Promise<UgcActor>;
  createUgcProject(p: NewUgcProject): Promise<UgcProject>;
  getUgcProject(id: string): Promise<UgcProject | null>;

  /** Records a signup fingerprint; returns how many accounts already used it. */
  recordSignupFingerprint(userId: string, fingerprint: string): Promise<number>;

  uploadObject(bucket: "outputs" | "uploads", path: string, body: Uint8Array, contentType: string): Promise<void>;
  /** Public URL for outputs, short-lived signed URL for private uploads. */
  objectUrl(bucket: "outputs" | "uploads", path: string, expiresInSeconds?: number): Promise<string>;
}
