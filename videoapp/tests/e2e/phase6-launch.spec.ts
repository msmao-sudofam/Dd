import { expect, test } from "@playwright/test";

test("landing page: video wall, presets, pricing, FAQ, CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("One product photo in.");
  await expect(page.getByTestId("video-wall").locator("video").first()).toBeVisible();
  await expect(page.locator("#pricing").getByText("Starter")).toBeVisible();
  await page.getByText("What if a generation fails?").click();
  await expect(page.getByText(/refunded automatically if it fails/)).toBeVisible();
  await page.getByTestId("hero-cta").click();
  await expect(page).toHaveURL(/\/signup/);
});

test("legal pages, sitemap and robots", async ({ page, request }) => {
  for (const slug of ["terms", "privacy", "acceptable-use", "refunds"]) {
    const res = await page.goto(`/legal/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/presets/product-360-spin");
  expect(sitemap).toContain("<video:video>");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});

test("screens render on mobile without horizontal scroll", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const path of ["/", "/presets", "/presets/hero-shot", "/pricing", "/signup"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
  await ctx.close();
});
