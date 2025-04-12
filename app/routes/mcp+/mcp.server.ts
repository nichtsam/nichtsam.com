import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Transport } from './transport.server.ts'

export const transports = new Map<string, Transport>()

export async function connect(sessionId?: string) {
	const transport = new Transport({
		endpoint: '/mcp',
		sessionId,
		onclose: () => {
			console.log(`Transport ${transport.sessionId} closed.`)
			transports.delete(transport.sessionId)
		},
	})
	await server.connect(transport)
	transports.set(transport.sessionId, transport)
	return transport
}
export const server = new McpServer({
	name: 'nichtsam.com',
	version: '1.0.0',
})
