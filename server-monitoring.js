import { nodeProfilingIntegration } from '@sentry/profiling-node'
import * as Sentry from '@sentry/react-router'

export function init() {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,

		sendDefaultPii: true,

		enableLogs: true,

		tracesSampleRate: 1.0,
		profileSessionSampleRate: 1.0,

		integrations: [nodeProfilingIntegration()],
	})
}
