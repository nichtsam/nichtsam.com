import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { init as initAnalytics } from './utils/analytics.client'
import { init as initMonitoring } from './utils/monitoring.client'

initMonitoring()
initAnalytics()

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	)
})
