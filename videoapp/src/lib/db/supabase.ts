import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Job, LedgerEntry, Model, Preset, Profile, UgcActor, UgcProject } from "@/lib/types";
import { InsufficientCreditsError, type Db } from "./types";

let admin: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS — server code only. */
export function supabaseAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(env.supabaseUrl(), env.supabaseSecretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
// numeric columns come back from PostgREST as strings
const normModel = (m: Model): Model => ({ ...m, api_cost_usd: Number(m.api_cost_usd) });
const normJob = (j: Job): Job => ({ ...j, cost_usd: Number(j.cost_usd) });

export const supabaseDb: Db = {
  async getProfile(id) {
    return must(await supabaseAdmin().from("profiles").select("*").eq("id", id).maybeSingle()) as Profile | null;
  },
  async getProfileByReferralCode(code) {
    return must(
      await supabaseAdmin().from("profiles").select("*").eq("referral_code", code).maybeSingle(),
    ) as Profile | null;
  },
  async updateProfile(id, patch) {
    must(await supabaseAdmin().from("profiles").update(patch).eq("id", id));
  },
  async getProfileByStripeCustomer(c) {
    return must(
      await supabaseAdmin().from("profiles").select("*").eq("stripe_customer_id", c).maybeSingle(),
    ) as Profile | null;
  },
  async recordStripeEvent(id, type) {
    const { error } = await supabaseAdmin().from("stripe_events").insert({ id, type });
    if (!error) return true;
    if (error.code === "23505") return false;
    throw new Error(error.message);
  },
  async listProfiles(limit = 200) {
    return must(
      await supabaseAdmin().from("profiles").select("*").order("created_at", { ascending: false }).limit(limit),
    ) as Profile[];
  },

  async applyCredit(a) {
    const { data, error } = await supabaseAdmin().rpc("apply_credit_delta", {
      p_user_id: a.userId,
      p_delta: a.delta,
      p_reason: a.reason,
      p_job_id: a.jobId ?? null,
      p_stripe_event_id: a.stripeEventId ?? null,
      p_meta: a.meta ?? {},
    });
    if (error) {
      if (error.message.includes("insufficient_credits")) throw new InsufficientCreditsError();
      throw new Error(error.message);
    }
    const row = (Array.isArray(data) ? data[0] : data) as { applied: boolean; balance: number };
    return { applied: row.applied, balance: row.balance };
  },
  async listLedger(userId, limit = 50) {
    return must(
      await supabaseAdmin()
        .from("credit_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false })
        .limit(limit),
    ) as LedgerEntry[];
  },
  async hasLedgerReason(userId, reason) {
    const { count, error } = await supabaseAdmin()
      .from("credit_ledger")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("reason", reason);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  },
  async listLedgerSince(since, reasons) {
    return must(
      await supabaseAdmin().from("credit_ledger").select("*").gte("created_at", since).in("reason", reasons).limit(50000),
    ) as LedgerEntry[];
  },

  async listModels(opts) {
    let q = supabaseAdmin().from("models").select("*").order("sort_order");
    if (!opts?.includeDisabled) q = q.eq("enabled", true);
    return (must(await q) as Model[]).map(normModel);
  },
  async getModel(k) {
    const row = must(
      await supabaseAdmin()
        .from("models")
        .select("*")
        .eq(isUuid(k) ? "id" : "slug", k)
        .maybeSingle(),
    ) as Model | null;
    return row && normModel(row);
  },
  async upsertModel(m) {
    return normModel(
      must(await supabaseAdmin().from("models").upsert(m, { onConflict: "slug" }).select("*").single()) as Model,
    );
  },

  async listPresets(opts) {
    let q = supabaseAdmin().from("presets").select("*").order("sort_order");
    if (!opts?.includeDisabled) q = q.eq("enabled", true);
    return must(await q) as Preset[];
  },
  async getPreset(k) {
    return must(
      await supabaseAdmin()
        .from("presets")
        .select("*")
        .eq(isUuid(k) ? "id" : "slug", k)
        .maybeSingle(),
    ) as Preset | null;
  },
  async upsertPreset(p) {
    return must(await supabaseAdmin().from("presets").upsert(p, { onConflict: "slug" }).select("*").single()) as Preset;
  },
  async deletePreset(id) {
    must(await supabaseAdmin().from("presets").delete().eq("id", id));
  },

  async createJob(j) {
    return normJob(must(await supabaseAdmin().from("jobs").insert(j).select("*").single()) as Job);
  },
  async updateJob(id, patch) {
    return normJob(must(await supabaseAdmin().from("jobs").update(patch).eq("id", id).select("*").single()) as Job);
  },
  async transitionJob(id, from, patch) {
    const row = must(
      await supabaseAdmin().from("jobs").update(patch).eq("id", id).in("status", from).select("*").maybeSingle(),
    ) as Job | null;
    return row && normJob(row);
  },
  async claimJobRequest(id, expected, patch) {
    const row = must(
      await supabaseAdmin().from("jobs").update(patch).eq("id", id).eq("provider_request_id", expected).select("*").maybeSingle(),
    ) as Job | null;
    return row && normJob(row);
  },
  async getJob(id) {
    const row = must(await supabaseAdmin().from("jobs").select("*").eq("id", id).maybeSingle()) as Job | null;
    return row && normJob(row);
  },
  async findJobByProviderRequest(provider, reqId) {
    const row = must(
      await supabaseAdmin()
        .from("jobs")
        .select("*")
        .eq("provider", provider)
        .eq("provider_request_id", reqId)
        .maybeSingle(),
    ) as Job | null;
    return row && normJob(row);
  },
  async listJobs(userId, limit = 60) {
    return (
      must(
        await supabaseAdmin()
          .from("jobs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit),
      ) as Job[]
    ).map(normJob);
  },
  async listJobsSince(since) {
    return (must(await supabaseAdmin().from("jobs").select("*").gte("created_at", since).limit(50000)) as Job[]).map(
      normJob,
    );
  },
  async countJobsSince(userId, since) {
    const { count, error } = await supabaseAdmin()
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async logModeration(e) {
    must(
      await supabaseAdmin().from("moderation_events").insert({
        user_id: e.userId,
        kind: e.kind,
        excerpt: e.excerpt.slice(0, 500),
        reasons: e.reasons,
        source: e.source,
      }),
    );
  },
  async logConsent(e) {
    must(
      await supabaseAdmin().from("consent_log").insert({
        user_id: e.userId,
        upload_path: e.uploadPath,
        statement: e.statement,
        ip: e.ip,
        user_agent: e.userAgent,
      }),
    );
  },

  async listUgcActors(userId) {
    let q = supabaseAdmin().from("ugc_actors").select("*").eq("enabled", true).order("sort_order");
    q = userId ? q.or(`owner_id.is.null,owner_id.eq.${userId}`) : q.is("owner_id", null);
    const rows = must(await q) as UgcActor[];
    return [...rows.filter((a) => a.owner_id), ...rows.filter((a) => !a.owner_id)];
  },
  async getUgcActor(k) {
    return must(
      await supabaseAdmin().from("ugc_actors").select("*").eq(isUuid(k) ? "id" : "slug", k).maybeSingle(),
    ) as UgcActor | null;
  },
  async createUgcActor(a) {
    return must(await supabaseAdmin().from("ugc_actors").insert(a).select("*").single()) as UgcActor;
  },
  async createUgcProject(p) {
    return must(await supabaseAdmin().from("ugc_projects").insert(p).select("*").single()) as UgcProject;
  },
  async getUgcProject(id) {
    return must(await supabaseAdmin().from("ugc_projects").select("*").eq("id", id).maybeSingle()) as UgcProject | null;
  },

  async recordSignupFingerprint(userId, fingerprint) {
    const { data, error } = await supabaseAdmin().rpc("record_signup_fingerprint", {
      p_user_id: userId,
      p_fingerprint: fingerprint,
    });
    if (error) throw new Error(error.message);
    return Number(data ?? 0);
  },

  async uploadObject(bucket, path, body, contentType) {
    const { error } = await supabaseAdmin().storage.from(bucket).upload(path, body, { contentType, upsert: true });
    if (error) throw new Error(error.message);
  },
  async objectUrl(bucket, path, expiresIn = 3600) {
    if (bucket === "outputs") return supabaseAdmin().storage.from(bucket).getPublicUrl(path).data.publicUrl;
    const { data, error } = await supabaseAdmin().storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },
};
