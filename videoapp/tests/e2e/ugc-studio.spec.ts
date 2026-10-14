import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

const photo = path.join(__dirname, "fixtures/product.jpg");

async function toFormat(page: Page, opts: { creators?: string[] } = {}) {
  await page.goto("/billing");
  await page.getByTestId("buy-pro").click(); // mock checkout: +1000 credits
  await page.goto("/ugc/new");
  await page.getByTestId("ugc-name").fill("Glow Serum");
  await page.getByLabel("What is it?").fill("A lightweight vitamin C serum");
  await page.getByLabel("Benefit 1").fill("Soaks in fast");
  await page.getByLabel("Offer (optional)").fill("20% off this week");
  await page.getByTestId("ugc-photo-consent").check();
  await page.getByTestId("ugc-photo-input").setInputFiles(photo);
  await expect(page.getByTestId("ugc-photo-preview")).toBeVisible();
  await page.getByTestId("ugc-write-scripts").click();
  await expect(page.getByTestId("ugc-script")).toHaveCount(4);
  await expect(page.getByTestId("ugc-pick-0")).toBeChecked();
  await expect(page.getByTestId("ugc-pick-1")).toBeChecked();
  await page.getByTestId("ugc-next").click();
  for (const c of opts.creators ?? []) await page.getByTestId(`ugc-actor-${c}`).click();
  await page.getByTestId("ugc-next").click();
}

test("brand makes UGC ads: product → scripts → 2 creators → 4 finished ads with exact cost", async ({ page }) => {
  await signUp(page);
  await toFormat(page, { creators: ["jordan"] });
  await expect(page.getByTestId("ugc-total")).not.toHaveText("0 cr");
  const total = Number((await page.getByTestId("ugc-total").innerText()).replace(/\D/g, ""));
  const before = Number(await page.getByTestId("ugc-balance").innerText());
  await expect(page.getByTestId("ugc-generate")).toContainText("Generate 4 ads");
  await page.getByTestId("ugc-generate").click();

  const cards = page.getByTestId("job-card");
  await expect(cards).toHaveCount(4);
  await expect(page.getByTestId("ugc-balance")).toHaveText(String(before - total));
  for (let i = 0; i < 4; i++) await expect(cards.nth(i)).toHaveAttribute("data-status", "succeeded", { timeout: 90_000 });
  const src = await cards.first().locator("video").getAttribute("src");
  const res = await page.request.get(src!);
  expect(res.headers()["content-type"]).toBe("video/mp4");
  expect((await res.body()).length).toBeGreaterThan(50_000);

  await page.goto("/library");
  await expect(page.getByTestId("library-grid").getByTestId("job-card")).toHaveCount(4);
});

test("a UGC ad that fails mid-pipeline refunds its credits", async ({ page }) => {
  await signUp(page);
  await toFormat(page);
  const before = Number(await page.getByTestId("ugc-balance").innerText());
  await page.getByTestId("ugc-fail-at").selectOption("avatar");
  await page.getByTestId("ugc-generate").click();
  const cards = page.getByTestId("job-card");
  await expect(cards).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(cards.nth(i)).toHaveAttribute("data-status", "refunded", { timeout: 60_000 });
  await expect(page.getByTestId("ugc-balance")).toHaveText(String(before));
});

test("brand can star in their own ad (consent required) and the landing page explains the studio", async ({ page }) => {
  await page.goto("/ugc");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("UGC ads without hiring creators");
  await expect(page.getByTestId("ugc-landing-actor")).toHaveCount(8);

  await signUp(page);
  await page.goto("/ugc/new");
  await page.getByTestId("ugc-name").fill("Trail Mix Co");
  await page.getByTestId("ugc-write-scripts").click();
  await page.getByTestId("ugc-next").click();
  await page.getByTestId("ugc-self-open").click();
  await expect(page.getByTestId("ugc-self-input")).toBeDisabled();
  await page.getByTestId("ugc-self-name").fill("Mo");
  await page.getByTestId("ugc-self-consent").check();
  await page.getByTestId("ugc-self-input").setInputFiles(photo);
  await expect(page.locator('[data-testid^="ugc-actor-me-"]')).toHaveAttribute("aria-pressed", "true");
});
