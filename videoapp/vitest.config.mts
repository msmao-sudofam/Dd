import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/sql/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    fileParallelism: false,
    env: { MOCK_BACKEND: "true", MOCK_DB_PATH: ".data-test/vitest-db.json", SESSION_SECRET: "test-secret" },
  },
});
