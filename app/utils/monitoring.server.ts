import { init as sentryInit } from "@sentry/remix";
import { env } from "./env.server";

export function init() {
  sentryInit({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1,
  });
}
