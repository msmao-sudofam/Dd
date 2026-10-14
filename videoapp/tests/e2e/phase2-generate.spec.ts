import path from "node:path";
import { expect, test } from "@playwright/test";
import { SIGNUP_BONUS_CREDITS } from "../../src/lib/pricing";
import { balance, signUp } from "./helpers";

// Phase 2 "Done when": I can generate a 9:16 clip, see it land in my library, and a forced failure refunds me.

test("generate a 9:16 clip and find it in the library", async ({ page }) => {
  await signUp(page);
  await page.goto("/generate");
  await page.getByTestId("model-ltx-fast").click();
  await expect(page.getByLabel("Aspect")).toHaveValue("9:16");
  await expect(page.getByTestId("cost")).toHaveText("24 credits");
  await page.getByLabel("Prompt").fill("A glass serum bottle on wet black stone, slow orbit");
  await page.getByTestId("generate").click();

  const card = page.getByTestId("job-card").first();
  await expect(card).toHaveAttribute("data-status", /queued|running/);
  await expect(page.getByTestId("gen-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS - 24));
  await expect(card).toHaveAttribute("data-status", "succeeded", { timeout: 20_000 });
  const video = card.locator("video");
  await expect(video).toHaveAttribute("src", /\/api\/storage\/outputs\/.+\.mp4$/);
  const box = await video.boundingBox();
  expect(box!.height).toBeGreaterThan(box!.width); // 9:16

  const res = await page.request.get((await video.getAttribute("src"))!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("video/mp4");

  await page.goto("/library");
  await expect(page.getByTestId("library-grid").getByTestId("job-card")).toHaveCount(1);
  await expect(page.getByTestId("download")).toBeVisible();
});

test("a forced failure refunds the credits", async ({ page }) => {
  await signUp(page);
  await page.goto("/generate");
  await page.getByTestId("model-ltx-fast").click();
  await page.getByLabel("Prompt").fill("this one will fail");
  await page.getByTestId("force-fail").check();
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("gen-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS - 24));

  const card = page.getByTestId("job-card").first();
  await expect(card).toHaveAttribute("data-status", "refunded", { timeout: 20_000 });
  await expect(page.getByTestId("gen-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS));
  await page.reload();
  expect(await balance(page)).toBe(SIGNUP_BONUS_CREDITS);
});

test("image-to-video requires consent and a photo, and moderation blocks public figures", async ({ page }) => {
  await signUp(page);
  await page.goto("/generate");
  await page.getByTestId("model-ltx-i2v").click();
  await expect(page.getByTestId("file-input")).toBeDisabled();
  await page.getByTestId("consent-checkbox").check();
  await page.getByTestId("file-input").setInputFiles(path.join(__dirname, "fixtures/product.jpg"));
  await expect(page.getByTestId("upload-preview")).toBeVisible();

  await page.getByLabel("Prompt").fill("Elon Musk holding this bottle");
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("generate-error")).toContainText("public figures");
  await expect(page.getByTestId("gen-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS));

  await page.getByLabel("Prompt").fill("Bottle slowly rotating, studio light");
  await page.getByTestId("generate").click();
  await expect(page.getByTestId("job-card").first()).toHaveAttribute("data-status", "succeeded", { timeout: 20_000 });
});

test("webhooks reject bad signatures", async ({ request }) => {
  for (const p of ["mock", "fal", "replicate", "self"]) {
    const res = await request.post(`/api/webhooks/${p}`, { data: { request_id: "x", status: "OK" } });
    expect([401, 503]).toContain(res.status());
  }
  expect((await request.post("/api/webhooks/nope", { data: {} })).status()).toBe(404);
});
