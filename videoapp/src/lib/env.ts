// Central place for "is this service configured?" decisions. Every external service has a
// mock fallback so the app runs end-to-end with zero keys (BUILD_PLAN §6 rule 2).

const truthy = (v: string | undefined) => v === "true" || v === "1";

export const env = {
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  brandName: () => process.env.NEXT_PUBLIC_BRAND_NAME ?? "Reelforge",

  supabaseUrl: () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // New key names (sb_publishable_/sb_secret_) preferred; legacy anon/service_role still accepted.
  supabasePublishableKey: () =>
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseSecretKey: () => process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  falKey: () => process.env.FAL_KEY ?? "",
  replicateToken: () => process.env.REPLICATE_API_TOKEN ?? "",
  replicateWebhookSecret: () => process.env.REPLICATE_WEBHOOK_SECRET ?? "",
  runpodApiKey: () => process.env.RUNPOD_API_KEY ?? "",
  runpodEndpointId: () => process.env.RUNPOD_ENDPOINT_ID ?? "",
  selfWebhookSecret: () => process.env.SELF_WEBHOOK_SECRET ?? "",

  openaiKey: () => process.env.OPENAI_API_KEY ?? "",

  stripeSecretKey: () => process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",

  resendKey: () => process.env.RESEND_API_KEY ?? "",
  emailFrom: () => process.env.EMAIL_FROM ?? "Reelforge <noreply@example.com>",

  sessionSecret: () => process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret-change-me",
  mockDbPath: () => process.env.MOCK_DB_PATH ?? ".data/mock-db.json",
  adminEmails: () =>
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
};

/** File-backed DB + cookie auth instead of Supabase. */
export function isMockBackend(): boolean {
  if (truthy(process.env.MOCK_BACKEND)) return true;
  return !env.supabaseUrl() || !env.supabasePublishableKey() || !env.supabaseSecretKey();
}

/** Force every provider to the mock adapter even if keys exist. */
export function isMockProvidersForced(): boolean {
  return truthy(process.env.MOCK_PROVIDERS);
}

export function isMockStripe(): boolean {
  return truthy(process.env.MOCK_STRIPE) || !env.stripeSecretKey();
}

/** Missing-key report for PROGRESS.md / admin page. */
export function missingKeys(): string[] {
  const out: string[] = [];
  if (!env.supabaseUrl()) out.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabasePublishableKey()) out.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!env.supabaseSecretKey()) out.push("SUPABASE_SECRET_KEY");
  if (!env.falKey()) out.push("FAL_KEY");
  if (!env.openaiKey()) out.push("OPENAI_API_KEY");
  if (!env.stripeSecretKey()) out.push("STRIPE_SECRET_KEY");
  if (!env.stripeWebhookSecret()) out.push("STRIPE_WEBHOOK_SECRET");
  if (!env.resendKey()) out.push("RESEND_API_KEY");
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) out.push("NEXT_PUBLIC_POSTHOG_KEY");
  if (!env.runpodApiKey()) out.push("RUNPOD_API_KEY / RUNPOD_ENDPOINT_ID");
  return out;
}
