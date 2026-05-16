import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/unit.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "src/**/*.integration.{test,spec}.{ts,tsx}",
      "tests/integration/**/*.{test,spec}.{ts,tsx}",
      "node_modules",
      ".next",
    ],
  },
});
