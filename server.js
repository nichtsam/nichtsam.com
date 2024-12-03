import 'dotenv/config'
import crypto from 'crypto'
import { createRequestHandler } from '@remix-run/express'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import getPort, { portNumbers } from 'get-port'
import helmet from 'helmet'
import morgan from 'morgan'
import sourceMapSupport from 'source-map-support'
import { printUrls } from './server-utils.js'

const MODE = process.env.NODE_ENV ?? 'development'
const DISALLOW_INDEXING = process.env.DISALLOW_INDEXING === 'true'

sourceMapSupport.install()

if (MODE === 'production' && process.env.SENTRY_DSN) {
	import('./server-monitoring.js').then(({ init }) => init())
}

const viteDevServer =
	MODE === 'production'
		? undefined
		: await import('vite').then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
				}),
			)

const app = express()

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

app.use(
	morgan('tiny', {
		skip:
			MODE === 'development'
				? (req, res) => {
						if (
							req.url.startsWith('/node_modules') ||
							req.url.startsWith('/app') ||
							req.url.startsWith('/@') ||
							req.url.startsWith('/__')
						) {
							if (res.statusCode === 200 || res.statusCode === 304) {
								return true
							}
						}
					}
				: undefined,
	}),
)

app.use((_, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})

app.use(
	helmet({
		referrerPolicy: { policy: 'same-origin' },
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			directives: {
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
					(_, res) => `'nonce-${res.locals.cspNonce}'`,
					"'unsafe-inline'", // backward compatibility for 'nonces'
					'https:', // backward compatibility for 'strict-dynamic'
					"'unsafe-eval'", // mdx-bundler needs this
				],
				'script-src-attr': [(_, res) => `'nonce-${res.locals.cspNonce}'`],
				'upgrade-insecure-requests': null,
			},
		},
	}),
)

if (DISALLOW_INDEXING) {
	app.use((_, res, next) => {
		res.set('X-Robots-Tag', 'noindex, nofollow')
		next()
	})
}

// handle asset requests
if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	app.use(
		'/assets',
		express.static('build/client/assets', {
			immutable: true,
			maxAge: '1y',
		}),
	)
}
app.use(express.static('build/client', { maxAge: '1h' }))

function getBuild() {
	return viteDevServer
		? viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: import('./build/server/index.js')
}

// handle SSR requests
app.all(
	'*',
	createRequestHandler({
		getLoadContext: (_, res) => ({
			cspNonce: res.locals.cspNonce,
			serverBuild: getBuild(),
		}),
		build: getBuild,
	}),
)

const desiredPort = Number(process.env.PORT || 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})

const server = app.listen(portToUse, async () => {
	const addr = server.address()
	const portUsed = typeof addr === 'object' ? addr.port : addr

	if (portUsed !== desiredPort) {
		console.warn(
			chalk.yellow(
				`⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}

	console.log(`🚀 App started`)

	printUrls(portUsed)

	console.log(chalk.bold('Press Ctrl+C to stop'))
})

closeWithGrace(async ({ err }) => {
	if (err) {
		console.error(chalk.red(err))
		console.error(chalk.red(err.stack))
		process.exit(1)
	}

	await new Promise((resolve, reject) => {
		server.close((e) => (e ? reject(e) : resolve('ok')))
	})
})
