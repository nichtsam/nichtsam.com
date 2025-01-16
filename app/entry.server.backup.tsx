import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import { captureException, captureRemixServerException } from '@sentry/remix'
import chalk from 'chalk'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	ServerRouter,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
	type LoaderFunctionArgs,
} from 'react-router'
import { env, forceEnvValidation } from '#app/utils/env.server.ts'
import { NonceProvider } from './utils/nonce-provider.tsx'

forceEnvValidation()

const streamTimeout = 5_000

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>
export default function handleRequest(
	...[
		request,
		responseStatusCode,
		responseHeaders,
		reactRouterContext,
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

		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<ServerRouter
					context={reactRouterContext}
					url={request.url}
					nonce={nonce}
				/>
			</NonceProvider>,

			{
				[callbackName]: () => {
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
				onShellError: (err) => {
					reject(err)
				},
				onError: () => {
					didError = true
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
		void captureRemixServerException(error, 'remix.server', request)
	} else {
		console.error(chalk.red(error))
		captureException(error)
	}
}
