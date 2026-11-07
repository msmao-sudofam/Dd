import path from "node:path";
import { expect, test } from "@playwright/test";
import { uniqueEmail } from "./helpers";

const photo = path.join(__dirname, "fixtures/product.jpg");

// "Try it on your product": a visitor previews their own product before signing up, and the photo follows them
// through sign-up into their first clip. Providers are mocked, so the ad frame is the labelled demo sample.
test("visitor previews their product, signs up, and one click makes the clip", async ({ page }) => {
  await page.goto("/");
  const stage = page.getByTestId("try-stage");
  await expect(stage.getByRole("heading", { name: "Try it on your product." })).toBeVisible();

  // Consent comes first.
  await stage.getByTestId("try-url").fill("shop.example.com/products/glow-serum");
  await stage.getByTestId("try-url-submit").click();
  await expect(stage.getByTestId("try-error")).toContainText("Tick the box");

  await stage.getByTestId("try-consent").check();
  await stage.getByTestId("try-file").setInputFiles(photo);
  await expect(stage.getByTestId("try-photo")).toBeVisible();
  // The rest of the site now knows about the product.
  await expect(page.getByTestId("try-bar")).toBeVisible();
  await expect(page.locator("#presets").getByRole("heading", { level: 2 })).toHaveText("Pick a look for your product.");
  expect(await page.locator('[data-testid^="preset-"]').count()).toBeGreaterThanOrEqual(20); // tiles are all still there

  // One free ad frame.
  await stage.getByTestId("try-look-studio").click();
  await stage.getByTestId("try-still-btn").click();
  await expect(stage.getByTestId("try-still")).toBeVisible({ timeout: 20_000 });
  await expect(stage).toContainText("Sample frame (demo mode)");
  await expect(stage).toContainText("1 free preview left");
  const cta = stage.getByTestId("try-cta");
  await expect(cta).toHaveAttribute("href", "/signup?next=%2Fpresets%2Fhero-shot");

  // Sign up from there: lands on the preset with the previewed frame ready, cost on the button.
  await cta.click();
  await expect(page).toHaveURL(/\/signup\?next=/);
  await page.getByLabel("Email").fill(uniqueEmail("try"));
  await page.getByLabel("Password").fill("correct-horse-1");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/presets\/hero-shot$/);
  await expect(page.getByTestId("carried")).toBeVisible();
  const go = page.getByTestId("generate-carried");
  await expect(go).toContainText("24 credits");
  await go.click();
  const card = page.getByTestId("job-card");
  await expect(card).toHaveAttribute("data-status", "succeeded", { timeout: 20_000 });
  await expect(page.getByTestId("credit-balance")).toContainText("0");
});

test("links that are not on the public internet are refused, and a product can be removed", async ({ page }) => {
  await page.goto("/");
  const stage = page.getByTestId("try-stage");
  await stage.getByTestId("try-consent").check();
  for (const [link, message] of [
    ["http://localhost/admin", "public website"],
    ["http://127.0.0.1/", "public internet"],
    ["http://169.254.169.254/latest/meta-data/", "public internet"],
    ["https://example.com:8443/x", "port number"],
  ] as const) {
    await stage.getByTestId("try-url").fill(link);
    await stage.getByTestId("try-url-submit").click();
    await expect(stage.getByTestId("try-error")).toContainText(message);
  }
  await expect(page.getByTestId("try-bar")).toHaveCount(0);

  await stage.getByTestId("try-file").setInputFiles(photo);
  await expect(stage.getByTestId("try-photo")).toBeVisible();
  await stage.getByTestId("try-forget").click();
  await expect(stage.getByRole("heading", { name: "Try it on your product." })).toBeVisible();
  await expect(page.getByTestId("try-bar")).toHaveCount(0);
});

test("the feed: one clip per screen, each with the same action, and it fits a phone", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.getByTestId("open-feed").click();
  await expect(page).toHaveURL(/\/feed$/);
  const feed = page.getByTestId("feed");
  // Every preset with a preview clip is in the feed (the seeded 20, plus any an admin added in another spec).
  await expect.poll(() => feed.locator("[data-feed-item]").count()).toBeGreaterThanOrEqual(20);
  await expect(feed.getByTestId("feed-cta-product-360-spin")).toHaveAttribute("href", "/signup?next=%2Fpresets%2Fproduct-360-spin");
  // Each clip fills the feed, and swiping lands exactly on the next one.
  const [itemH, feedH] = await feed.evaluate((el) => [el.querySelector("[data-feed-item]")!.clientHeight, el.clientHeight]);
  expect(itemH).toBe(feedH);
  await feed.evaluate((el) => el.scrollBy(0, el.clientHeight));
  await expect.poll(() => feed.evaluate((el) => Math.round(el.scrollTop / el.clientHeight))).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  // A deep link opens on that clip.
  await page.goto("/feed#melt");
  await expect.poll(() => feed.evaluate((el) => el.querySelector('[data-slug="melt"]')!.getBoundingClientRect().top - el.getBoundingClientRect().top)).toBeLessThan(2);
  await ctx.close();
});
