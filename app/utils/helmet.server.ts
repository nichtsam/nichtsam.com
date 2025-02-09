import { env } from './env.server'
import { helmet as _helmet } from './web-helmet'

const MODE = env.NODE_ENV ?? 'development'

export function helmet(options: {
	html: true
	nonce: string
	cors?: boolean
}): Headers
export function helmet(options?: {
	html?: false
	nonce?: string
	cors?: boolean
}): Headers
export function helmet({
	html = false,
	cors = false,
	nonce,
}: {
	html?: boolean
	cors?: boolean
	nonce?: string
} = {}) {
	return _helmet({
		html,
		cors,
		options: {
			contentSecurityPolicy: {
				directives: {
					fetch: {
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
					navigation: {
						'form-action': ["'self'", 'github.com/login/oauth/authorize'],
					},
				},
			},
		},
	})
}
