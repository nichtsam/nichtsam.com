import { PassThrough } from 'node:stream'
import { styleText } from 'node:util'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
	ServerRouter,
} from 'react-router'
import { forceEnvValidation } from './utils/env.server'

forceEnvValidation()

const streamTimeout = 5_000

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default function handleRequest(
	...[
		request,
		responseStatusCode,
		responseHeaders,
		routerContext,
	]: DocRequestArgs
) {
	const callbackName = isbot(request.headers.get('user-agent'))
		? 'onAllReady'
		: 'onShellReady'

	return new Promise((resolve, reject) => {
		let didError = false
		let shellRendered = false

		const { pipe, abort } = renderToPipeableStream(
			<ServerRouter context={routerContext} url={request.url} />,
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
}
