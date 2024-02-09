import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["app/**/*.test.ts?(x)"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.ts?(x)"],
    },
  },
});
