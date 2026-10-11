import { expect, test } from "@playwright/test";

test("landing page: scroll film, presets, pricing, FAQ, CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("photo in.");
  const film = page.getByTestId("scroll-film");
  await expect(film.locator("canvas")).toBeVisible();
  await expect(film.locator('[data-beat="0"]')).toHaveAttribute("data-active", "true");
  // Scrolling through the pinned section advances the beats and paints frames.
  const box = (await film.boundingBox())!;
  await page.mouse.wheel(0, box.height * 0.9);
  await expect(film.locator('[data-beat="2"]')).toHaveAttribute("data-active", "true");
  expect(await film.locator("canvas").evaluate((c: HTMLCanvasElement) => c.width > 0)).toBe(true);
  await expect(page.locator("#pricing").getByText("Starter")).toBeVisible();
  await page.getByText("What if a generation fails?").click();
  await expect(page.getByText(/refunded automatically if it fails/)).toBeVisible();
  await film.locator('[data-beat="2"]').getByTestId("hero-cta").click();
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
