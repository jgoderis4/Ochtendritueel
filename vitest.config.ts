import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** Vitest-config: `@/` → src, zodat tests dezelfde imports gebruiken als de app. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
