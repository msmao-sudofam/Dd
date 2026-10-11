import { expect, test } from "@playwright/test";
import { SIGNUP_BONUS_CREDITS } from "../../src/lib/pricing";
import { signUp } from "./helpers";

// Phase 1 "Done when": I can sign up, log in, and see my credit balance.
test("sign up, log out, log in, see credit balance", async ({ page }) => {
  const { email, password } = await signUp(page);
  await expect(page.getByTestId("dashboard-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS));

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("credit-balance")).toHaveCount(0);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByTestId("auth-error")).toContainText("Invalid");

  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("dashboard-balance")).toHaveText(String(SIGNUP_BONUS_CREDITS));
  await expect(page.getByTestId("credit-balance")).toContainText(String(SIGNUP_BONUS_CREDITS));
});

test("protected pages redirect to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});
