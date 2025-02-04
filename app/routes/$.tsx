// This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the Remix and/or browser default.

import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type MetaArgs } from 'react-router'
import {
	GeneralErrorBoundary,
	generalNotFoundHandler,
} from '#app/components/error-boundary.tsx'
import { buildMeta, notFoundMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/$'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		statusMetas: {
			404: notFoundMeta,
		},
	})

export function loader() {
	throw new Response('Not found', { status: 404 })
}

export function action() {
	throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
	// due to the loader, this component will never be rendered, but we'll return
	// the error boundary just in case.
	return <ErrorBoundary />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: generalNotFoundHandler,
			}}
		/>
	)
}
