import {
  init as sentryInit,
  browserTracingIntegration,
  replayIntegration,
} from "@sentry/remix";
import { useLocation, useMatches } from "@remix-run/react";
import { useEffect } from "react";

export function init() {
  sentryInit({
    dsn: window.ENV.SENTRY_DSN,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,

    integrations: [
      browserTracingIntegration({
        useEffect,
        useLocation,
        useMatches,
      }),
      replayIntegration(),
    ],
  });
}
