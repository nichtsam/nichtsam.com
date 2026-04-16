import * as Sentry from '@sentry/react-router'

export function init() {
	Sentry.init({
		dsn: window.ENV.SENTRY_DSN,

		sendDefaultPii: true,

		enableLogs: true,

		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,

		integrations: [
			Sentry.reactRouterTracingIntegration(),
			Sentry.replayIntegration(),
			Sentry.feedbackIntegration({
				colorScheme: 'system',
			}),
		],
	})
}
