import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
	ServerRouter,
} from 'react-router'
import { forceEnvValidation } from './utils/env.server'
import { NonceProvider } from './utils/nonce-provider'

forceEnvValidation()

const streamTimeout = 5_000

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>
export default function handleRequest(
	...[
		request,
		responseStatusCode,
		responseHeaders,
		routerContext,
		loadContext,
	]: DocRequestArgs
) {
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

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					)

					pipe(body)
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

	if (error instanceof Error) {
		console.error(chalk.red(error.stack))
		Sentry.captureException(error)
	} else {
		console.error(chalk.red(error))
		Sentry.captureException(error)
	}
}
