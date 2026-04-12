import { useMDXComponent } from '@content-collections/mdx/react'
import { ArticleImage } from '#app/components/image.tsx'

const customMdxComponents = { ArticleImage }

export const useMdxComponent = (code: string) => {
	const Component = useMDXComponent(code)
	return (props: any) => (
		<Component
			components={{ ...customMdxComponents, ...props.components }}
			{...props}
		/>
	)
}
