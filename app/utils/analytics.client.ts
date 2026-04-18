import posthog from 'posthog-js'

export function init() {
	if (
		window.ENV.NODE_ENV !== 'production' ||
		!window.ENV.POSTHOG_PROJECT_TOKEN
	) {
		return
	}

	posthog.init(window.ENV.POSTHOG_PROJECT_TOKEN, {
		cookieless_mode: 'always',
		api_host: window.ENV.POSTHOG_HOST,
		defaults: '2026-01-30',
		__add_tracing_headers: [window.location.host, 'localhost'],
	})
}
