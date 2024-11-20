import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { init as sentryInit } from '@sentry/remix'

export function init() {
	sentryInit({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1,
		profilesSampleRate: 1,
		autoInstrumentRemix: true,
		integrations: [nodeProfilingIntegration()],
	})
}
