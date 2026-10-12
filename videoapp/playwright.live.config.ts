import { defineConfig, devices } from "@playwright/test";

// Live smoke test against a running app that uses the REAL Supabase project (keys from .env.local).
// Start the app yourself first, with mocked providers/Stripe so nothing is charged:
//   MOCK_PROVIDERS=true MOCK_STRIPE=true MOCK_PROVIDER_DELAY_MS=1500 npx next dev
//   npx playwright test -c playwright.live.config.ts
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  testDir: "tests/live",
  timeout: 120_000,
  workers: 1,
  reporter: [["list"]],
  retries: 0,
  use: { baseURL: process.env.LIVE_BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure", ...devices["Desktop Chrome"] },
});
