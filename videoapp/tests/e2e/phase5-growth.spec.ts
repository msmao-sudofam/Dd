import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REFERRAL_BONUS_CREDITS, SIGNUP_BONUS_CREDITS } from "../../src/lib/pricing";
import { balance, loginOrSignUp, signUp, uniqueEmail } from "./helpers";

const me = async (page: import("@playwright/test").Page) => (await page.request.get("/api/me")).json();

test("referral: both sides get credits after the referee's first purchase (not at signup)", async ({ browser }) => {
  const a = await browser.newPage();
  await signUp(a, uniqueEmail("referrer"));
  const { referral_code } = await me(a);

  const b = await browser.newPage();
  await b.goto(`/?ref=${referral_code}`);
  await signUp(b, uniqueEmail("referee"));
  await a.reload();
  expect(await balance(a)).toBe(SIGNUP_BONUS_CREDITS); // nothing yet

  await b.goto("/billing");
  await b.getByTestId("buy-starter").click();
  await expect(b.getByTestId("billing-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS + 100 + REFERRAL_BONUS_CREDITS));
  await a.reload();
  expect(await balance(a)).toBe(SIGNUP_BONUS_CREDITS + REFERRAL_BONUS_CREDITS);

  await b.goto("/billing");
  await b.getByTestId("buy-starter").click(); // second purchase: no more referral credits
  await a.reload();
  expect(await balance(a)).toBe(SIGNUP_BONUS_CREDITS + REFERRAL_BONUS_CREDITS);
});

test("only one signup bonus per device; disposable emails are blocked", async ({ page }) => {
  await signUp(page, uniqueEmail("first"));
  await page.getByRole("button", { name: "Log out" }).click();

  await page.goto("/signup");
  await page.getByLabel("Email").fill("someone@mailinator.com");
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByTestId("auth-error")).toContainText("permanent email");

  await signUp(page, uniqueEmail("second-same-device"));
  await expect(page.getByTestId("dashboard-balance")).toHaveText("0");
  await expect(page.getByTestId("bonus-denied")).toBeVisible();
});

test("free-tier outputs are watermarked, paid ones aren't; Draft runs via the self adapter", async ({ page }) => {
  await signUp(page);
  await page.goto("/generate");
  await page.getByTestId("model-draft-self").click();
  await expect(page.getByTestId("cost")).toHaveText("10 credits");
  await page.getByLabel("Prompt").fill("a red sneaker on a pedestal");
  await page.getByTestId("generate").click();
  const card = page.getByTestId("job-card").first();
  await expect(card).toHaveAttribute("data-status", "succeeded", { timeout: 30_000 });
  const freeBytes = await (await page.request.get((await card.locator("video").getAttribute("src"))!)).body();
  const sample = readFileSync(path.join(__dirname, "../../public/mock/sample-9x16.mp4"));
  expect(freeBytes.equals(sample)).toBe(false); // re-encoded with the logo

  await page.goto("/billing");
  await page.getByTestId("buy-starter").click();
  await page.goto("/generate");
  await page.getByTestId("model-draft-self").click();
  await page.getByLabel("Prompt").fill("a blue sneaker on a pedestal");
  await page.getByTestId("generate").click();
  const paidCard = page.locator('[data-testid="job-card"]').first();
  await expect(paidCard).toHaveAttribute("data-status", "succeeded", { timeout: 30_000 });
  const paidBytes = await (await page.request.get((await paidCard.locator("video").getAttribute("src"))!)).body();
  expect(paidBytes.equals(sample)).toBe(true);
});

test("admin margin dashboard shows profit per model", async ({ page }) => {
  await signUp(page, `admin+${Date.now()}@example.com`); // not admin
  await page.goto("/admin/margin");
  await expect(page).toHaveURL(/\/dashboard/);

  const admin = await page.context().browser()!.newPage();
  await loginOrSignUp(admin, "admin@example.com");
  await admin.goto("/admin/margin");
  await expect(admin.getByRole("heading", { name: /Margin/ })).toBeVisible();
  await expect(admin.getByTestId("margin-draft-self")).toBeVisible();
  await expect(admin.getByTestId("margin-ltx-fast")).toBeVisible();
  expect(Number((await admin.getByTestId("cash-in").innerText()).replace("$", ""))).toBeGreaterThan(0);
});
