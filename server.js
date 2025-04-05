import 'dotenv/config'
import crypto from 'crypto'
import { styleText } from 'node:util'
import { helmet } from '@nichtsam/helmet/node-http'
import { createRequestHandler } from '@react-router/express'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import getPort, { portNumbers } from 'get-port'
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

const rateLimitConfig = {
	skip: () => MODE !== 'production',
	windowMs: 60 * 1000,
	max: 1000,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => {
		return req.get('fly-client-ip') ?? `${req.ip}`
	},
}

const strongestRateLimit = rateLimit({ ...rateLimitConfig, max: 10 })
const strongRateLimit = rateLimit({ ...rateLimitConfig, max: 100 })
const generalRateLimit = rateLimit(rateLimitConfig)

app.use((req, res, next) => {
	const criticalActions = ['/auth', '/onboarding']

	if (req.method !== 'GET' && req.method !== 'HEAD') {
		if (criticalActions.some((p) => req.path.startsWith(p))) {
			return strongestRateLimit(req, res, next)
		}

		return strongRateLimit(req, res, next)
	}

	return generalRateLimit(req, res, next)
})

app.use((_, res, next) => {
	res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
	next()
})

if (DISALLOW_INDEXING) {
	app.use((_, res, next) => {
		res.set('X-Robots-Tag', 'noindex, nofollow')
		next()
	})
}

app.use((_, res, next) => {
	helmet(res)
	next()
})

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
		? viteDevServer.ssrLoadModule('virtual:react-router/server-build')
		: import('./build/server/index.js')
}

const wantCors = ['/resources/og']
app.options(wantCors, cors())
app.get(wantCors, cors())

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
			styleText(
				'yellow',
				`⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
			),
		)
	}

	console.log(`🚀 App started`)

	printUrls(portUsed)

	console.log(styleText('bold', 'Press Ctrl+C to stop'))
})

closeWithGrace(async ({ err }) => {
	if (err) {
		console.error(styleText('red', String(err)))
		console.error(styleText('red', String(err.stack)))
		process.exit(1)
	}

	await new Promise((resolve, reject) => {
		server.close((e) => (e ? reject(e) : resolve('ok')))
	})
})
