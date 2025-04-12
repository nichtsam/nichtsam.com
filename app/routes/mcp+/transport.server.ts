import { randomUUID } from 'node:crypto'
import { type Transport as _Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import {
	JSONRPCMessageSchema,
	type JSONRPCMessage,
} from '@modelcontextprotocol/sdk/types.js'

export class Transport implements _Transport {
	#endpoint: string
	#stream?: ReadableStreamDefaultController<string>
	#sessionId: string
	get sessionId(): string {
		return this.#sessionId
	}

	onclose?: (() => void) | undefined
	onerror?: ((error: Error) => void) | undefined
	onmessage?: ((message: JSONRPCMessage) => void) | undefined

	#onclose?: (() => void) | undefined
	#onerror?: ((error: Error) => void) | undefined
	#onmessage?: ((message: JSONRPCMessage) => void) | undefined

	constructor({
		endpoint,
		sessionId,

		onclose,
		onerror,
		onmessage,
	}: {
		endpoint: string
		sessionId?: string
		onclose?: (() => void) | undefined
		onerror?: ((error: Error) => void) | undefined
		onmessage?: ((message: JSONRPCMessage) => void) | undefined
	}) {
		this.#endpoint = endpoint
		this.#sessionId = sessionId ?? randomUUID()

		this.#onclose = onclose
		this.#onerror = onerror
		this.#onmessage = onmessage
	}

	async start(): Promise<void> {
		if (this.#stream) {
			throw new Error(
				'Transport already started! If using Server class, note that connect() calls start() automatically.',
			)
		}
	}

	async send(message: JSONRPCMessage): Promise<void> {
		if (!this.#stream) {
			throw new Error('Not connected')
		}

		this.#stream.enqueue(`event: message\ndata: ${JSON.stringify(message)}\n\n`)

		throw new Error('Method not implemented.')
	}

	async close(): Promise<void> {
		if (this.#stream) {
			this.#stream?.close()
			this.#stream = undefined
		}

		this.onclose?.()
		this.#onclose?.()
	}

	async handleSSERequest(request: Request): Promise<Response> {
		const stream = new ReadableStream<string>({
			start: (controller) => {
				this.#stream = controller

				const endpoint = encodeURI(
					`${this.#endpoint}?sessionId=${this.#sessionId}`,
				)
				controller.enqueue(`event: endpoint\ndata: ${endpoint}\n\n`)

				request.signal.addEventListener('abort', async () => {
					console.log(`Stream for session ${this.#sessionId} aborted.`)
					await this.close()
				})
			},
			cancel: async (reason) => {
				console.log(
					`Stream for session ${this.#sessionId} canceled. Reason:`,
					reason,
				)
				await this.close()
			},
		})

		return new Response(stream, {
			headers: {
				Connection: 'keep-alive',
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache, no-transform',
				'Mcp-Session-Id': this.#sessionId,
			},
		})
	}

	async handlePostMessage(request: Request): Promise<Response> {
		if (!this.#stream) {
			return new Response('SSE connection not established', { status: 500 })
		}

		let body: unknown
		try {
			const contentType = request.headers.get('content-type')
			if (contentType?.split(';')[0] !== 'application/json') {
				throw new Error(`Unsupported content-type: ${contentType}`)
			}

			body = await request.json()
		} catch (error) {
			this.onerror?.(error as Error)
			return new Response(String(error), { status: 400 })
		}

		try {
			await this.handleMessage(body)
		} catch (error) {
			console.error(error)
			return new Response(`Invalid message: ${body}`, { status: 400 })
		}

		return new Response('Accepted', { status: 202 })
	}

	/**
	 * Handle a client message, regardless of how it arrived. This can be used to inform the server of messages that arrive via a means different than HTTP POST.
	 */
	async handleMessage(message: unknown): Promise<void> {
		let parsedMessage: JSONRPCMessage
		try {
			parsedMessage = JSONRPCMessageSchema.parse(message)
		} catch (error) {
			this.onerror?.(error as Error)
			this.#onerror?.(error as Error)
			throw error
		}

		this.onmessage?.(parsedMessage)
		this.#onmessage?.(parsedMessage)
	}
}
