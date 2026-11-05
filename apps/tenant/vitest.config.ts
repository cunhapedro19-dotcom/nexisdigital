import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@nexis/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@nexis/core": path.resolve(__dirname, "../../packages/core/src"),
      "@nexis/tenant": path.resolve(__dirname, "../../packages/tenant/src"),
      "@nexis/plugin": path.resolve(__dirname, "../../packages/plugin/src"),
    },
  },
});
