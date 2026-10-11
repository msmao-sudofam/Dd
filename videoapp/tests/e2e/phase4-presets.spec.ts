import path from "node:path";
import { expect, test } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

// Phase 4 "Done when": a new user can pick a preset, upload one photo, and get a usable clip in under 3 clicks.
test("new user: preset → photo → clip in 3 clicks", async ({ page }) => {
  await signUp(page);
  await page.goto("/");
  await expect(page.locator('[data-testid^="preset-"]')).toHaveCount(20);

  let clicks = 0;
  await page.getByTestId("preset-product-360-spin").click(); clicks++;
  await expect(page.getByRole("heading", { name: "360 Spin" })).toBeVisible();
  await page.getByTestId("consent-checkbox").check(); clicks++;
  await page.getByTestId("file-input").setInputFiles(path.join(__dirname, "fixtures/product.jpg")); clicks++; // choosing the photo starts it

  const card = page.getByTestId("job-card");
  await expect(card).toHaveAttribute("data-status", "succeeded", { timeout: 20_000 });
  await expect(card.locator("video")).toHaveAttribute("src", /\.mp4$/);
  expect(clicks).toBeLessThanOrEqual(3);
});

test("text-only preset needs a subject and charges the shown cost", async ({ page }) => {
  await signUp(page);
  await page.goto("/presets/product-teaser");
  await expect(page.getByTestId("generate")).toBeDisabled();
  await page.getByLabel("What's your product?").fill("matte black water bottle");
  await expect(page.getByTestId("generate")).toContainText("24 credits");
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("job-card")).toHaveAttribute("data-status", "succeeded", { timeout: 20_000 });
});

test("gallery filters by category and preset pages are SEO-ready", async ({ page }) => {
  await page.goto("/presets");
  await page.getByRole("tab", { name: "Camera Moves" }).click();
  await expect(page.locator('[data-testid^="preset-"]')).toHaveCount(5);
  await page.goto("/presets/crash-zoom");
  await expect(page).toHaveTitle(/Crash Zoom AI video preset/);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Try Crash Zoom free/ })).toBeVisible();
});

test("admin can add a preset without code; non-admins can't reach admin", async ({ page, browser }) => {
  await signUp(page, "admin@example.com");
  await page.goto("/admin/presets/new");
  await page.getByLabel("Name").fill("Neon Glow");
  await page.getByLabel("Slug (URL)").fill("neon-glow");
  await page.getByLabel("Description").fill("Bathes your product in neon.");
  await page.getByLabel(/Prompt template/).fill("The {subject} from the photo glowing under pink and blue neon lights, slow push-in.");
  await page.getByLabel("Preview video URL").fill("/presets/placeholder-effects.mp4");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/admin\/presets\?saved=1/);
  await page.goto("/presets/neon-glow");
  await expect(page.getByRole("heading", { name: "Neon Glow" })).toBeVisible();

  await page.goto("/admin/presets/new");
  await page.getByLabel("Name").fill("Hero swing");
  await page.getByLabel("Slug (URL)").fill("hero-swing");
  await page.getByLabel(/Prompt template/).fill("Spider-Man swings past the {subject}");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("admin-error")).toContainText("protected_ip");

  const other = await browser.newPage();
  await signUp(other, uniqueEmail("nonadmin"));
  await other.goto("/admin");
  await expect(other).toHaveURL(/\/dashboard/);
});
