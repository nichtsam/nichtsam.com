import { init as sentryInit } from "@sentry/remix";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function init() {
  sentryInit({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
    autoInstrumentRemix: true,
    integrations: [nodeProfilingIntegration()],
  });
}
