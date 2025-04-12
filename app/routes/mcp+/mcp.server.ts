import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { posts as postConfig } from '#app/utils/content/config.ts'
import { retrieve, retrieveAll } from '#app/utils/content/retrieve.ts'
import { loader as aboutLoader } from '../_site+/about.tsx'
import { Transport } from './transport.server.ts'
import { z } from 'zod'
import { getMdxSource } from '#app/utils/content/mdx/mdx.server.ts'

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

server.tool(
	'get-about',
	'Get information about Samuel Jensen, the owner of nichtsam.com',
	() => {
		const about = aboutLoader()
		return { content: [{ type: 'text', text: JSON.stringify(about) }] }
	},
)

server.tool('get-blog-posts', 'Get the list of blog posts', async () => {
	const posts = await retrieveAll(postConfig)

	if (posts.length === 0) {
		return { content: [{ type: 'text', text: 'No blog posts found' }] }
	}

	return { content: [{ type: 'text', text: JSON.stringify(posts) }] }
})

server.tool(
	'get_blog_post',
	'Get the content of a specific blog post by its slug',
	{ slug: z.string().describe('The slug of the blog post to retrieve') },
	async ({ slug }) => {
		const post = await retrieve(postConfig, slug)
		if (!post) {
			return {
				content: [
					{ type: 'text', text: `No blog post found with slug: ${slug}` },
				],
			}
		}
		const bundleSource = await getMdxSource(post.meta)
		if (!bundleSource) {
			return {
				content: [
					{ type: 'text', text: `Failed to get blog post for slug: ${slug}` },
				],
			}
		}

		const source = `${post.meta.base}:\n\n${bundleSource.source}`
		const files = bundleSource.files
			? Object.entries(bundleSource.files)
					.map(([filename, content]) => `${filename}:\n\n${content}`)
					.join('\n\n')
			: null

		if (files) {
			return {
				content: [
					{ type: 'text', text: source },
					{ type: 'text', text: files },
				],
			}
		}

		return {
			content: [{ type: 'text', text: source }],
		}
	},
)
