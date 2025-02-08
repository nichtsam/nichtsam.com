import {
	type CreateSecureHeaders,
	createSecureHeaders,
} from '@mcansh/http-helmet'
import { env } from './env.server'

const MODE = env.NODE_ENV ?? 'development'

export function helmet(
	type: 'html' | 'nonHtml' | 'nonHtmlWithCors',
	nonce?: string,
) {
	const cspReportOnly = false
	const cspHeaderName = cspReportOnly
		? 'Content-Security-Policy-Report-Only'
		: 'Content-Security-Policy'

	const html = {
		[cspHeaderName]: {
			'connect-src': [
				MODE === 'development' ? 'ws:' : undefined,
				process.env.SENTRY_DSN ? '*.sentry.io' : undefined,
				"'self'",
			],
			'font-src': ["'self'"],
			'frame-src': ["'self'"],
			'img-src': [
				"'self'",
				'data:',
				'avatars.githubusercontent.com',
				'cdn.discordapp.com',
				'res.cloudinary.com',
			],
			'form-action': ["'self'", 'github.com/login/oauth/authorize'],
			'script-src': [
				"'strict-dynamic'",
				"'self'",
				`'nonce-${nonce}'`,
				"'unsafe-inline'", // backward compatibility for 'nonces'
				'https:', // backward compatibility for 'strict-dynamic'
				"'unsafe-eval'", // mdx-bundler needs this
			],
			'script-src-attr': [`'nonce-${nonce}'`],
		},

		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Resource-Policy': 'same-origin',
		'Referrer-Policy': 'no-referrer',
		'Strict-Transport-Security': {
			maxAge: 15552000,
			includeSubDomains: true,
		},
		'X-Content-Type-Options': 'nosniff',
		'X-DNS-Prefetch-Control': 'off',
		'X-Frame-Options': 'SAMEORIGIN',
		'X-XSS-Protection': '0',
	} satisfies CreateSecureHeaders

	const nonHtml = {
		...html,
	} satisfies CreateSecureHeaders

	const nonHtmlWithCors = {
		...nonHtml,
		'Cross-Origin-Resource-Policy': 'cross-origin',
	} satisfies CreateSecureHeaders

	switch (type) {
		case 'html': {
			if (!nonce) {
				throw new Error('nonce missing')
			}
			const headers = createSecureHeaders(html)
			headers.set('X-Permitted-Cross-Domain-Policies', 'none')
			headers.set('Origin-Agent-Cluster', '?1')
			headers.set('X-Download-Options', 'noopen')
			return headers
		}
		case 'nonHtml': {
			const headers = createSecureHeaders(nonHtml)
			headers.delete(cspHeaderName)
			headers.set('X-Permitted-Cross-Domain-Policies', 'none')
			headers.set('Origin-Agent-Cluster', '?1')
			return headers
		}
		case 'nonHtmlWithCors': {
			const headers = createSecureHeaders(nonHtmlWithCors)
			headers.delete(cspHeaderName)
			headers.delete('Cross-Origin-Opener-Policy')
			headers.delete('X-Frame-Options')
			return headers
		}
	}
}
