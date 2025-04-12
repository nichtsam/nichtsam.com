import { type Route } from './+types/index.ts'
import { connect, transports } from './mcp.server.ts'

export async function loader({ request }: Route.LoaderArgs) {
	const sessionId =
		request.headers.get('Mcp-Session-Id') ??
		new URL(request.url).searchParams.get('sessionId') ??
		undefined

	const transport = await connect(sessionId)
	return transport.handleSSERequest(request)
}

export async function action({ request }: Route.ActionArgs) {
	const sessionId =
		request.headers.get('Mcp-Session-Id') ??
		new URL(request.url).searchParams.get('sessionId')

	if (!sessionId) {
		throw new Response('No session ID', {
			status: 400,
		})
	}

	const transport = transports.get(sessionId)

	if (!transport) {
		throw new Response('No transport', {
			status: 404,
		})
	}

	return transport.handlePostMessage(request)
}
