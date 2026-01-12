import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom", // important! pentru DOM (document/window)
    globals: true,        // optional, ca să nu mai importi expect, describe etc.
    setupFiles: "./vitest.setup.js", // optional, pentru mocks globale
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
