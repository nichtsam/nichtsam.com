import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import {
	useLocation,
	useNavigationType,
	createRoutesFromChildren,
	matchRoutes,
} from 'react-router'

export function init() {
	Sentry.init({
		dsn: window.ENV.SENTRY_DSN,
		tracesSampleRate: 1,
		profilesSampleRate: 1,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1,

		integrations: [
			Sentry.replayIntegration(),
			Sentry.browserProfilingIntegration(),
			Sentry.reactRouterV7BrowserTracingIntegration({
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
		],
	})
}
