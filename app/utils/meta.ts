import { type MetaArgs } from 'react-router'
import { type MetaDescriptors } from 'react-router/route-module'
import { removeTrailingSlash } from './misc'

interface Meta {
	title?: string
	description?: string
	url?: string
	image?: string
	keywords?: string[]
}

const domain = 'nichtsam.com'

export function buildMeta(args: MetaArgs, meta: Meta = {}): MetaDescriptors {
	const url = removeTrailingSlash(`https://${domain}${args.location.pathname}`)

	let title: string
	let description: string

	if (args.error) {
		title = 'Error | nichtsam.com'
		description =
			"Oops! Something went wrong. We're sorry for the inconvenience. Please try again later, or contact us if the issue persists."
	} else {
		title = meta.title ?? 'nichtsam.com'
		description =
			meta.description ??
			'Welcome to nichtsam.com! Explore the site to learn more about Samuel, his projects, and ideas.'
	}

	const { keywords, image } = meta

	return [
		{ title },
		{ name: 'description', content: description },

		{ name: 'keywords', content: keywords },
		{ name: 'image', content: image },

		{ property: 'og:site_name', content: 'nichtsam.com' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: image },
		{ property: 'og:url', content: url },

		{
			name: 'twitter:card',
			content: image ? 'summary_large_image' : 'summary',
		},
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: image },
		{ name: 'twitter:image:alt', content: title },
	]
}
