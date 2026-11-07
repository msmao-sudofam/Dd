import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

// Go-live Step 1/6: the Supabase implementation had only ever run against a Postgres shim.
// This drives the real project end to end: auth trigger → profile, login, ledger RPC, job rows,
// storage upload, refund. Providers and Stripe must be mocked on the server (see playwright.live.config.ts).

const email = `live-${Date.now()}@example.com`;
const password = randomBytes(12).toString("base64url");
let admin: SupabaseClient;
let userId = "";

test.beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase keys missing from .env.local");
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  // Confirmed up front so no confirmation email is sent to a fake address.
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  userId = data.user.id;
});

test.afterAll(async () => {
  if (!userId) return;
  const { data: files } = await admin.storage.from("outputs").list(userId);
  if (files?.length) await admin.storage.from("outputs").remove(files.map((f) => `${userId}/${f.name}`));
  await admin.auth.admin.deleteUser(userId); // cascades to profile, jobs and ledger
});

test("real Supabase: login, credits, generation, storage and refund", async ({ page }) => {
  // The auth.users trigger must have created the profile.
  const { data: profile } = await admin.from("profiles").select("credits_balance, plan").eq("id", userId).single();
  expect(profile).toEqual({ credits_balance: 0, plan: "free" });

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Mock Stripe purchase → apply_credit_delta through the service role.
  await page.goto("/billing");
  await page.getByTestId("buy-starter").click();
  await expect(page.getByTestId("billing-balance")).toHaveText("100");

  // Generation: debit → job row → mock provider → output re-uploaded to the public bucket.
  await page.goto("/generate");
  await page.getByTestId("model-ltx-fast").click();
  await expect(page.getByTestId("cost")).toHaveText("24 credits");
  await page.getByLabel("Prompt").fill("A glass serum bottle on wet black stone, slow orbit");
  await page.getByTestId("generate").click();
  const card = page.getByTestId("job-card").first();
  await expect(card).toHaveAttribute("data-status", "succeeded", { timeout: 60_000 });
  await expect(page.getByTestId("gen-balance")).toHaveText("76");
  const src = await card.locator("video").getAttribute("src");
  expect(src).toContain("/storage/v1/object/public/outputs/");
  const video = await page.request.get(src!);
  expect(video.status()).toBe(200);
  expect((await video.body()).length).toBeGreaterThan(10_000);

  // A forced failure refunds exactly once.
  await page.getByLabel("Prompt").fill("this one will fail");
  await page.getByTestId("force-fail").check();
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("job-card")).toHaveCount(2);
  await expect(page.getByTestId("job-card").first()).toHaveAttribute("data-status", "refunded", { timeout: 60_000 });
  await expect(page.getByTestId("gen-balance")).toHaveText("76");

  const { data: ledger } = await admin.from("credit_ledger").select("delta, reason").eq("user_id", userId).order("id");
  expect(ledger).toEqual([
    { delta: 100, reason: "purchase" },
    { delta: -24, reason: "generation" },
    { delta: -24, reason: "generation" },
    { delta: 24, reason: "refund" },
  ]);
});
