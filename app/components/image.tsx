import { Resize } from '@cloudinary/url-gen/actions/resize'
import { useMemo } from 'react'
import { cloudinary } from '#app/utils/image.ts'

interface CloudinaryImageProps
	extends Omit<
		React.DetailedHTMLProps<
			React.ImgHTMLAttributes<HTMLImageElement>,
			HTMLImageElement
		>,
		'src' | 'srcSet' | 'sizes'
	> {
	id: string
	widths: number[]
	sizes: string[]
}
export function CloudinaryImage({
	id,
	widths,
	sizes,
	alt,
	loading = 'lazy',
	...imgProps
}: CloudinaryImageProps) {
	const { src, srcSet } = useMemo(() => {
		const averageWidth = Math.ceil(
			widths.reduce((a, s) => a + s) / widths.length,
		)

		const src = cloudinary
			.image(id)
			.resize(Resize.scale().width(averageWidth))
			.toURL()

		const srcSet = widths
			.map(
				(width) =>
					`${cloudinary.image(id).resize(Resize.scale().width(width)).toURL()} ${width}w`,
			)
			.join(', ')

		return { src, srcSet }
	}, [id, widths])

	return (
		<img
			{...imgProps}
			alt={alt}
			src={src}
			srcSet={srcSet}
			sizes={sizes.join(', ')}
			loading={loading}
		/>
	)
}

export function BlogImage({
	id,
	alt,
}: {
	id: CloudinaryImageProps['id']
	alt: string
}) {
	return (
		<CloudinaryImage
			id={id}
			alt={alt}
			className="w-full"
			sizes={[
				'(min-width: 1536px) 97.5ch',
				'(min-width: 1280px) 73.125ch',
				'(min-width: 655px) 65ch',
				'100vw',
			]}
			widths={[300, 600, 900, 1200, 1500, 1800]}
		/>
	)
}
