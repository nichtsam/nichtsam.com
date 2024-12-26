import { PassThrough } from 'node:stream'
import {
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
	type LoaderFunctionArgs,
	createReadableStreamFromReadable,
} from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { captureException, captureRemixServerException } from '@sentry/remix'
import chalk from 'chalk'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { env, forceEnvValidation } from '#app/utils/env.server.ts'
import { NonceProvider } from './utils/nonce-provider.tsx'

forceEnvValidation()

const ABORT_DELAY = 5_000

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>
export default function handleRequest(
	...[
		request,
		responseStatusCode,
		responseHeaders,
		remixContext,
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
				<RemixServer
					context={remixContext}
					url={request.url}
					abortDelay={ABORT_DELAY}
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

		setTimeout(abort, ABORT_DELAY)
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
