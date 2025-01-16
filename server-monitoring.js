import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

export function init() {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1,
		profilesSampleRate: 1,

		integrations: [nodeProfilingIntegration()],
	})
}
