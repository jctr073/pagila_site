import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/integration.setup.ts"],
    include: [
      "src/**/*.integration.{test,spec}.{ts,tsx}",
      "tests/integration/**/*.{test,spec}.{ts,tsx}",
    ],
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
