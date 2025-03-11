import { nodeProfilingIntegration } from '@sentry/profiling-node'
import * as Sentry from '@sentry/react-router'

export function init() {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1,
		profilesSampleRate: 1,

		integrations: [nodeProfilingIntegration()],
	})
}
