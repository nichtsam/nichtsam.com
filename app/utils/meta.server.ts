import { MetaFunction, type MetaArgs } from 'react-router'
import { type MetaDescriptors } from 'react-router/route-module'

interface Meta {
	title: string
	description: string
	url: string | URL
	image?: string
	keywords?: string[]
}

export function buildMeta(args: MetaFunction, meta: Meta): MetaDescriptors {
	console.log({ args })
	// const url = new URL(meta.url)
	// const domain = url.host

	return [
		// { title },
		// { name: 'description', content: description },
		// { name: 'keywords', content: keywords },
		// { name: 'image', content: image },
		//
		// { property: 'og:site_name', content: 'nichtsam.com' },
		// { property: 'og:type', content: 'website' },
		// { property: 'og:title', content: title },
		// { property: 'og:description', content: description },
		// { property: 'og:image', content: image },
		// { property: 'og:url', content: url },
		//
		// {
		// 	name: 'twitter:card',
		// 	content: image ? 'summary_large_image' : 'summary',
		// },
		// { name: 'twitter:title', content: title },
		// { name: 'twitter:description', content: description },
		// { name: 'twitter:image', content: image },
		// { name: 'twitter:image:alt', content: title },
		// { property: 'twitter:domain', content: domain },
		// { property: 'twitter:url', content: url },
	]
}
