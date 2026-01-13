import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // Deoarece ambele sunt în root, calea este simplă:
    setupFiles: "./vitest.setup.js", 
  },
  resolve: {
    alias: {
      // Această parte este corectă pentru a mapa folderul src
      "@": path.resolve(__dirname, "./src"),
    },
  },
});