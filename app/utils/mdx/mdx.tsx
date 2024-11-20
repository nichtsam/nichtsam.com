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

export const useMdxComponent = (code: string) => {
	return useMemo(() => {
		const component = getMdxComponent(code)
		return component
	}, [code])
}
