import { env } from './env.server'

const MODE = env.NODE_ENV ?? 'development'

type HelmetHeaders = {
	'Content-Security-Policy'?: string
	'Cross-Origin-Opener-Policy'?: string
	'Cross-Origin-Resource-Policy': string
	'Origin-Agent-Cluster': string
	'Referrer-Policy': string
	'Strict-Transport-Security': string
	'X-Content-Type-Options': string
	'X-DNS-Prefetch-Control': string
	'X-Download-Options'?: string
	'X-Frame-Options'?: string
	'X-Permitted-Cross-Domain-Policies': string
	'X-XSS-Protection': string
}

export function helmet(
	type: 'html' | 'nonHtml' | 'nonHtmlWithCors',
	nonce?: string,
): HelmetHeaders {
	switch (type) {
		case 'html':
			if (!nonce) {
				throw new Error('nonce missing')
			}
			return html(nonce)
		case 'nonHtml':
			return nonHtml
		case 'nonHtmlWithCors':
			return nonHtmlWithCors
	}
}

const html = (nonce: string): HelmetHeaders => ({
	'Content-Security-Policy': Object.entries({
		'connect-src': [
			MODE === 'development' ? 'ws:' : null,
			process.env.SENTRY_DSN ? '*.sentry.io' : null,
			"'self'",
		].filter(Boolean),
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
	})
		.map(([key, value]) => `${key} ${value.join(' ')};`)
		.join(''),

	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Resource-Policy': 'same-origin',
	'Origin-Agent-Cluster': '?1',
	'Referrer-Policy': 'no-referrer',
	'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
	'X-Content-Type-Options': 'nosniff',
	'X-DNS-Prefetch-Control': 'off',
	'X-Download-Options': 'noopen',
	'X-Frame-Options': 'SAMEORIGIN',
	'X-Permitted-Cross-Domain-Policies': 'none',
	'X-XSS-Protection': '0',
})

const nonHtml: HelmetHeaders = html('')
delete nonHtml['Content-Security-Policy']
delete nonHtml['Cross-Origin-Opener-Policy']
delete nonHtml['X-Download-Options']
delete nonHtml['X-Frame-Options']

const nonHtmlWithCors: HelmetHeaders = {
	...nonHtml,
	'Cross-Origin-Resource-Policy': 'cross-origin',
}
