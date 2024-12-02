import { remember } from '@epic-web/remember'
import { bundleMDX as _bundleMDX } from 'mdx-bundler'
import PQueue from 'p-queue'
import { cachified, longLivedCache } from '../cache.server.ts'
import { type ServerTiming } from '../timings.server.ts'
import { type MdxBundleSource } from './mdx.server.ts'

async function bundleMDX({ source, files }: MdxBundleSource) {
	const mdxBundle = await _bundleMDX({
		source,
		files,
		mdxOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? [])]
			options.rehypePlugins = [...(options.rehypePlugins ?? [])]
			return options
		},
	})

	return {
		code: mdxBundle.code,
	}
}

const queue = remember(
	'compile-mdx-queue',
	() =>
		new PQueue({
			concurrency: 1,
			throwOnTimeout: true,
			timeout: 1000 * 30,
		}),
)

const queuedBundleMDX = async (...args: Parameters<typeof bundleMDX>) =>
	await queue.add(() => bundleMDX(...args), { throwOnTimeout: true })

function cachedBundleMDX({
	slug,
	bundle,
	timing,
}: {
	slug: string
	bundle: MdxBundleSource
	timing?: ServerTiming
}) {
	const key = `mdx:${slug}:compile`
	const compileMdx = cachified({
		key,
		cache: longLivedCache,
		timing,
		getFreshValue: () => queuedBundleMDX(bundle),
	})

	return compileMdx
}

export { cachedBundleMDX as bundleMDX }
