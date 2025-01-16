import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (window.ENV.NODE_ENV === 'production' && window.ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.ts').then(({ init }) => init())
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	)
})
