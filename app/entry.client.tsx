import { PostHogProvider } from '@posthog/react'
import posthog from 'posthog-js'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (window.ENV.NODE_ENV === 'production' && window.ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.ts').then(({ init }) => init())
}

if (import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN) {
	posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, {
		api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
		defaults: '2026-01-30',
		__add_tracing_headers: [window.location.host, 'localhost'],
	})
}

startTransition(() => {
	hydrateRoot(
		document,
		<PostHogProvider client={posthog}>
			<StrictMode>
				<HydratedRouter />
			</StrictMode>
		</PostHogProvider>,
	)
})
