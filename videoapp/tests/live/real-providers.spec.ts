import { expect, test, type APIRequestContext } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Go-live Step 3: ONE real generation per model through the whole pipeline (debit → fal → poll → watermark → storage).
// THIS SPENDS REAL MONEY (about $4.30 at list prices for the full set) and is skipped unless SMOKE_REAL=1.
//   npx next dev            (FAL_KEY set, MOCK_PROVIDERS unset; Stripe may stay mocked)
//   SMOKE_REAL=1 npx playwright test -c playwright.live.config.ts real-providers
// SMOKE_ONLY=ltx-fast,flux-schnell limits the run, so a retry never pays for the clips that already passed.
// Outputs are saved to test-results/smoke/ and summarised in test-results/smoke/report.json.

const RUN = process.env.SMOKE_REAL === "1";
const ONLY = (process.env.SMOKE_ONLY ?? "").split(",").filter(Boolean);
const OUT = path.join("test-results", "smoke");
const PROMPT = "A glass serum bottle on wet black stone, slow orbit, soft studio light, premium product commercial";

// slug, duration (the shortest the model allows), list price in USD for that duration
const MODELS: { slug: string; duration: number | null; usd: number; image?: boolean }[] = [
  { slug: "flux-schnell", duration: null, usd: 0.003 },
  { slug: "ltx-fast", duration: 6, usd: 0.36 },
  { slug: "ltx-i2v", duration: 6, usd: 0.36, image: true },
  { slug: "wan-26", duration: 5, usd: 0.5 },
  { slug: "kling-3", duration: 5, usd: 0.42 },
  { slug: "kling-3-i2v", duration: 5, usd: 0.42, image: true },
  { slug: "veo-31", duration: 4, usd: 1.6 },
];

const email = `smoke-${Date.now()}@example.com`;
const password = randomBytes(12).toString("base64url");
let admin: SupabaseClient;
let userId = "";
const report: Record<string, unknown>[] = [];

interface JobRow {
  id: string;
  status: string;
  stage?: string | null;
  error?: string | null;
  output_url?: string | null;
  credits_charged: number;
  cost_usd: number;
  provider: string;
}

async function upload(request: APIRequestContext, file: string): Promise<string> {
  const res = await request.post("/api/uploads", {
    multipart: { consent: "true", file: { name: path.basename(file), mimeType: "image/jpeg", buffer: readFileSync(file) } },
  });
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { path: string }).path;
}

/** Polling /api/jobs?ids= is what reconciles a job with fal on localhost (webhooks can't reach it). */
async function waitFor(request: APIRequestContext, id: string, minutes: number): Promise<JobRow> {
  const until = Date.now() + minutes * 60_000;
  let job: JobRow | undefined;
  while (Date.now() < until) {
    const res = await request.get(`/api/jobs?ids=${id}`, { timeout: 300_000 });
    job = ((await res.json()) as { jobs: JobRow[] }).jobs[0];
    if (job && job.status !== "queued" && job.status !== "running") return job;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return job!;
}

async function save(request: APIRequestContext, name: string, job: JobRow, started: number, listUsd: number) {
  const row: Record<string, unknown> = {
    name, status: job.status, provider: job.provider, seconds: Math.round((Date.now() - started) / 1000),
    credits: job.credits_charged, cost_usd_recorded: job.cost_usd, list_usd: listUsd, error: job.error ?? null,
  };
  if (job.output_url) {
    const res = await request.get(job.output_url);
    const body = await res.body();
    const ext = (res.headers()["content-type"] ?? "").includes("video") ? "mp4" : "jpg";
    writeFileSync(path.join(OUT, `${name}.${ext}`), body);
    Object.assign(row, { http: res.status(), bytes: body.length, file: `${name}.${ext}` });
  }
  report.push(row);
  writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 1));
  return row;
}

test.describe.configure({ mode: "serial" });
test.skip(!RUN, "set SMOKE_REAL=1 to spend real provider money");

test.beforeAll(async ({ browser }, testInfo) => {
  mkdirSync(OUT, { recursive: true });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase keys missing from .env.local");
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY missing from .env.local");
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  userId = data.user.id;
  // Free plan on purpose: every output also goes through the watermark step.
  const { error: e2 } = await admin.rpc("apply_credit_delta", { p_user_id: userId, p_delta: 400, p_reason: "admin", p_job_id: null, p_stripe_event_id: null, p_meta: { note: "go-live step 3 smoke test" } });
  if (e2) throw e2;

  const page = await browser.newPage({ baseURL: testInfo.project.use.baseURL, storageState: { cookies: [], origins: [] } });
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: path.join(OUT, "state.json") });
  await page.close();
});

test.afterAll(async () => {
  if (!userId) return;
  for (const bucket of ["outputs", "uploads"]) {
    const { data: files } = await admin.storage.from(bucket).list(userId);
    if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
  }
  await admin.auth.admin.deleteUser(userId); // cascades to profile, jobs, ledger, custom creators
});

// Written by beforeAll; contexts and the request fixture are created per test, after it exists.
test.use({ storageState: path.join(OUT, "state.json") });

for (const m of MODELS) {
  test(`real fal generation: ${m.slug}`, async ({ request }) => {
    test.skip(ONLY.length > 0 && !ONLY.includes(m.slug), "not in SMOKE_ONLY");
    test.setTimeout(15 * 60_000);
    const { data: model } = await admin.from("models").select("id").eq("slug", m.slug).single();
    const imagePath = m.image ? await upload(request, "public/presets/hero-shot.jpg") : null;
    const started = Date.now();
    const res = await request.post("/api/generate", { data: { modelId: model!.id, prompt: PROMPT, duration: m.duration, aspectRatio: "9:16", imagePath } });
    expect(res.status(), await res.text()).toBe(200);
    const { job } = (await res.json()) as { job: JobRow };
    expect(job.provider, "the mock adapter must not answer a real smoke test").toBe("fal");
    const done = await waitFor(request, job.id, 12);
    const row = await save(request, m.slug, done, started, m.usd);
    console.log(JSON.stringify(row));
    expect(done.status, done.error ?? "").toBe("succeeded");
    expect(row.http).toBe(200);
    expect(row.bytes as number).toBeGreaterThan(m.duration ? 50_000 : 5_000);
  });
}

test("real UGC ad: voice → talking creator → captions (standard, no b-roll)", async ({ request }) => {
  test.skip(ONLY.length > 0 && !ONLY.includes("ugc"), "not in SMOKE_ONLY");
  test.setTimeout(25 * 60_000);
  // A library creator's portrait is served by this app, which fal cannot reach on localhost, so the smoke test
  // casts an uploaded creator instead (signed Supabase URL). The portrait is the AI-generated library one.
  const uploadPath = await upload(request, "public/ugc/actors/maya.jpg");
  const a = await request.post("/api/ugc/actors", { data: { name: "Smoke", uploadPath, voice: "Sarah", consent: true } });
  expect(a.status(), await a.text()).toBe(200);
  const { actor } = (await a.json()) as { actor: { id: string } };
  const started = Date.now();
  const res = await request.post("/api/ugc/render", {
    data: {
      product: { name: "Glow Serum", description: "A lightweight vitamin C face serum." },
      scripts: [{ angle: "problem", hook: "Okay, my skin has never looked this awake.", body: ["Two drops in the morning and that is the whole routine."], cta: "Try it this week.", on_screen_hook: "awake skin" }],
      actorIds: [actor.id], aspect: "9:16", captions: "bold", broll: false, quality: "standard", aiLabel: true,
    },
  });
  expect(res.status(), await res.text()).toBe(200);
  const { jobs } = (await res.json()) as { jobs: JobRow[] };
  const done = await waitFor(request, jobs[0].id, 22);
  const row = await save(request, "ugc", done, started, 0.61);
  console.log(JSON.stringify(row));
  expect(done.status, done.error ?? "").toBe("succeeded");
  expect(row.bytes as number).toBeGreaterThan(100_000);
});
