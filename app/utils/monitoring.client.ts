import * as Sentry from '@sentry/react-router'

export function init() {
	Sentry.init({
		dsn: window.ENV.SENTRY_DSN,

		sendDefaultPii: true,

		tracesSampleRate: 1,
		profilesSampleRate: 1,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1,

		integrations: [
			Sentry.replayIntegration(),
			Sentry.browserProfilingIntegration(),
		],
	})
}
