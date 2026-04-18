import { PassThrough } from 'node:stream'
import { styleText } from 'node:util'
import { contentSecurity } from '@nichtsam/helmet/content'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/react-router'
import {
	getMetaTagTransformer,
	wrapSentryHandleRequest,
} from '@sentry/react-router'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
	ServerRouter,
} from 'react-router'
import { env, forceEnvValidation } from './utils/env.server'
import { NonceProvider } from './utils/nonce-provider'

forceEnvValidation()

const MODE = env.NODE_ENV ?? 'development'

const streamTimeout = 5_000

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default wrapSentryHandleRequest(handleRequest)
function handleRequest(
	...[
		request,
		responseStatusCode,
		responseHeaders,
		routerContext,
		loadContext,
	]: DocRequestArgs
) {
	if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
		responseHeaders.append('Document-Policy', 'js-profiling')
	}

	const nonce = String(loadContext.cspNonce)
	const callbackName = isbot(request.headers.get('user-agent'))
		? 'onAllReady'
		: 'onShellReady'

	return new Promise((resolve, reject) => {
		let didError = false
		let shellRendered = false

		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<ServerRouter context={routerContext} url={request.url} nonce={nonce} />
			</NonceProvider>,
			{
				[callbackName]() {
					shellRendered = true
					const body = new PassThrough()
					const stream = createReadableStreamFromReadable(body)

					responseHeaders.set('Content-Type', 'text/html')
					contentSecurity(responseHeaders, {
						crossOriginEmbedderPolicy: false,
						contentSecurityPolicy: {
							directives: {
								fetch: {
									'connect-src': [
										MODE === 'development' ? 'ws:' : undefined,
										env.SENTRY_DSN ? '*.sentry.io' : undefined,
										...(env.POSTHOG_HOST
											? [
													env.POSTHOG_HOST,
													env.POSTHOG_HOST.replace(
														/(\/\/[^.]+)/,
														(m) => `${m}-assets`,
													),
												]
											: []),
										"'self'",
									],
									'font-src': ["'self'"],
									'frame-src': ["'self'"],
									'img-src': ["'self'", 'data:', 'res.cloudinary.com'],
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
									'form-action': ["'self'"],
								},
							},
						},
					})

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					)

					pipe(getMetaTagTransformer(body))
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					didError = true
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error)
					}
				},
				nonce,
			},
		)

		setTimeout(abort, streamTimeout + 5000)
	})
}

export function handleError(
	error: unknown,
	{ request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
	if (request.signal.aborted) {
		return
	}

	let errorMessage: string
	if (error instanceof Error) {
		errorMessage = error.stack ?? error.message
	} else {
		errorMessage = String(error)
	}

	console.error(styleText('red', errorMessage))
	Sentry.captureException(error)
}
