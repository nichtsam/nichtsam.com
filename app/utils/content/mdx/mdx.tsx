import { LRUCache } from 'lru-cache'
import * as mdxBundler from 'mdx-bundler/client/index.js'
import { useMemo } from 'react'
import { BlogImage } from '#app/components/image.tsx'

const customMdxComponents = { BlogImage }

function getMdxComponent(code: string) {
	const Component = mdxBundler.getMDXComponent(code)
	function MdxComponent({ components, ...rest }: mdxBundler.MDXContentProps) {
		return (
			<Component
				components={{ ...customMdxComponents, ...components }}
				{...rest}
			/>
		)
	}
	return MdxComponent
}

const mdxComponentCache = new LRUCache<
	string,
	ReturnType<typeof getMdxComponent>
>({
	max: 1000,
})

export const useMdxComponent = (code: string) => {
	return useMemo(() => {
		if (mdxComponentCache.has(code)) {
			return mdxComponentCache.get(code)!
		}
		const component = getMdxComponent(code)
		mdxComponentCache.set(code, component)
		return component
	}, [code])
}
