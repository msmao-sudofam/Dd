import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const mockEnv = {
  MOCK_BACKEND: "true",
  MOCK_PROVIDERS: "true",
  MOCK_STRIPE: "true",
  MOCK_PROVIDER_DELAY_MS: "1500",
  MOCK_DB_PATH: ".data-test/e2e-db.json",
  SESSION_SECRET: "e2e-secret",
  NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
  ADMIN_EMAILS: "admin@example.com",
  STRIPE_WEBHOOK_SECRET: "whsec_e2e_test_secret",
};

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", ...devices["Desktop Chrome"] },
  webServer: {
    // E2E_DEV=1 uses `next dev` for faster iteration; default is a production build.
    command:
      process.env.E2E_DEV === "1"
        ? `rm -rf .data-test/e2e* && next dev -p ${PORT}`
        : `rm -rf .data-test/e2e* && next build && next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: mockEnv,
  },
});
