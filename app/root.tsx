import {
	Links,
	Meta,
	type MetaArgs,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from 'react-router'
import appStylesheet from '#app/styles/app.css?url'
import {
	publicEnv,
	forceEnvValidation,
	type PublicEnv,
} from '#app/utils/env.server.ts'
import { FaviconMeta, faviconLinks } from '#app/utils/favicon.tsx'
import { type Route } from './+types/root.ts'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { NavProgress } from './components/nav-progress.tsx'
import { SiteFooter } from './components/site-footer.tsx'
import { SiteHeader } from './components/site-header.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { pipeHeaders } from './utils/headers.server.ts'
import { buildMeta } from './utils/meta.ts'

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: appStylesheet },
	{ rel: 'manifest', href: '/site.webmanifest' },
	...faviconLinks,
]

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
	})

export const headers: Route.HeadersFunction = (args) => {
	// HTML points at hashed assets that the next deploy deletes, so browsers
	// must revalidate it instead of reusing a stale copy
	args.loaderHeaders.set('Cache-Control', 'no-cache')

	return pipeHeaders(args)
}

export const loader = () => {
	forceEnvValidation()

	return {
		env: publicEnv,
	}
}

function Document({
	children,
	env,
}: {
	children: React.ReactNode
	env?: PublicEnv
}) {
	const allowIndexing = env?.ALLOW_INDEXING

	return (
		<html lang="en" className="relative">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{!allowIndexing && <meta name="robots" content="noindex, nofollow" />}
				<FaviconMeta />

				<Meta />
				<Links />
			</head>
			<body className="bg-background text-foreground" suppressHydrationWarning>
				{children}

				<NavProgress />

				<Scripts />
				<ScrollRestoration />
			</body>
		</html>
	)
}

function App() {
	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<main className="grow">
				<Outlet />
			</main>
			<SiteFooter />
		</div>
	)
}

function AppWithProviders() {
	return (
		<TooltipProvider>
			<App />
		</TooltipProvider>
	)
}

export default AppWithProviders

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>('root')

	return <Document env={data?.env}>{children}</Document>
}

export const ErrorBoundary = GeneralErrorBoundary
