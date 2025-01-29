import { remember } from '@epic-web/remember'
import { bundleMDX as _bundleMDX } from 'mdx-bundler'
import { type BundleMDX } from 'mdx-bundler/dist/types'
import PQueue from 'p-queue'
import { cachified, longLivedCache } from '#app/utils/cache.server.ts'
import { type ServerTiming } from '#app/utils/timings.server.ts'

export type MdxSource = {
	source: Required<BundleMDX<any>>['source']
	files?: BundleMDX<any>['files']
}

async function bundleMDX({ source, files }: MdxSource) {
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
	bundleSource,
	timing,
}: {
	slug: string
	bundleSource: MdxSource
	timing?: ServerTiming
}) {
	const key = `mdx:${slug}:compile`
	const compileMdx = cachified({
		key,
		cache: longLivedCache,
		ttl: 1000 * 60 * 60 * 24 * 14,
		swr: Infinity,
		timing,
		getFreshValue: () => queuedBundleMDX(bundleSource),
	})

	return compileMdx
}

export { cachedBundleMDX as bundleMDX }
