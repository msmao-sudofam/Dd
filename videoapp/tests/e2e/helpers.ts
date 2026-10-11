import { expect, type Page } from "@playwright/test";

export const uniqueEmail = (tag: string) => `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

export async function signUp(page: Page, email = uniqueEmail("user"), password = "correct-horse-1") {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  return { email, password };
}

export async function balance(page: Page): Promise<number> {
  const text = await page.getByTestId("credit-balance").innerText();
  return Number(text.match(/\d+/)![0]);
}
