import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["app/**/*.test.ts?(x)"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.ts?(x)"],
    },
  },
});
