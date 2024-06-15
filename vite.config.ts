import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    cssMinify: process.env.NODE_ENV === "production",

    sourcemap: true,
  },

  plugins: [
    tsconfigPaths(),

    remix({
      serverModuleFormat: "esm",

      ignoredRouteFiles: ["**/*"],
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: ["**/*.test.{js,jsx,ts,tsx}"],
        });
      },
    }),

    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          disable: process.env.NODE_ENV !== "production",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,

          release: {
            name: process.env.COMMIT_SHA,
          },
          sourcemaps: {
            filesToDeleteAfterUpload: ["./build/**/*.map"],
          },
        })
      : null,
  ],
});
