import {
	type ErrorResponse,
	isRouteErrorResponse,
	type Location,
	type MetaArgs,
	type useRouteLoaderData,
} from 'react-router'
import { type MetaDescriptors } from 'react-router/route-module'
import { type loader } from '#app/root.tsx'
import { removeTrailingSlash } from './misc'

type RootData = ReturnType<typeof useRouteLoaderData<typeof loader>>

interface Meta {
	title?: string
	description?: string
	image?: string | null
	keywords?: string[]
}

export function buildMeta({
	args: { error, params, location, matches },
	meta,

	statusMetas,
	defaultStatusMeta = fallbackStatusMeta,
	unexpectedErrorMeta = fallbackUnexpectedErrorMeta,
}: {
	args: MetaArgs
	meta?: Meta

	statusMetas?: Record<number, StatusMeta>
	defaultStatusMeta?: StatusMeta
	unexpectedErrorMeta?: UnexpectedErrorMeta
}): MetaDescriptors {
	const rootData = matches.find((m) => m.id === 'root')?.data as RootData
	const origin = rootData ? rootData.requestInfo.origin : 'https://nichtsam.com'
	const url = `${origin}${removeTrailingSlash(location.pathname)}${location.search}`

	if (error) {
		if (isRouteErrorResponse(error)) {
			meta = (statusMetas?.[error.status] ?? defaultStatusMeta)({
				error,
				params,
				location,
				origin,
			})
		} else {
			meta = unexpectedErrorMeta({
				error,
				params,
				location,
				origin,
			})
		}
	}

	meta = {
		title: 'nichtsam.com',
		description:
			'Welcome to nichtsam.com! Explore the site to learn more about Samuel, his projects, and ideas.',
		image: `${origin}/resources/og/image.png`,
		...meta,
	}

	return [
		{ title: meta.title },
		{ name: 'description', content: meta.description },

		...(meta.keywords ? [{ name: 'keywords', content: meta.keywords }] : []),
		{ name: 'image', content: meta.image },

		{ property: 'og:site_name', content: 'nichtsam.com' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:title', content: meta.title },
		{ property: 'og:description', content: meta.description },
		{ property: 'og:image', content: meta.image },
		{ property: 'og:url', content: url },

		{
			name: 'twitter:card',
			content: meta.image ? 'summary_large_image' : 'summary',
		},
		{ name: 'twitter:title', content: meta.title },
		{ name: 'twitter:description', content: meta.description },
		{ name: 'twitter:image', content: meta.image },
		{ name: 'twitter:image:alt', content: meta.title },
	]
}

type StatusMeta = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
	location: Location
	origin: string
}) => Meta

type UnexpectedErrorMeta = (info: {
	error: unknown
	params: Record<string, string | undefined>
	location: Location
	origin: string
}) => Meta

const fallbackUnexpectedErrorMeta: UnexpectedErrorMeta = ({ origin }) => ({
	title: `Error | nichtsam.com`,
	description:
		"Oops! Something went wrong. We're sorry for the inconvenience. Please try again later, or contact us if the issue persists.",
	image: `${origin}/resources/og/error.png`,
})

const fallbackStatusMeta: StatusMeta = ({ error }) => ({
	title: `${error.status} | nichtsam.com`,
	description:
		"Oops! Something went wrong. We're sorry for the inconvenience. Please try again later, or contact us if the issue persists.",
	image: `${origin}/resources/og/error.png`,
})

export const notFoundMeta: StatusMeta & UnexpectedErrorMeta = () => ({
	title: 'Not Found | nichtsam.com',
	description: "Sorry, I couldn't find this page for you 😭",
	image: `${origin}/resources/og/not-found.png`,
})
