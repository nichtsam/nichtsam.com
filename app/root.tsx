import clsx from 'clsx'
import { OpenImgContextProvider } from 'openimg/react'
import {
	data,
	Links,
	Meta,
	type MetaArgs,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRouteLoaderData,
} from 'react-router'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
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
import { Toaster } from './components/ui/sonner.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { getUser, getUserId, logout } from './utils/auth/auth.server.ts'
import { ClientHintsCheck, getHints } from './utils/client-hints.tsx'
import { csrf } from './utils/csrf.server.ts'
import { pipeHeaders } from './utils/headers.server.ts'
import { honeypot } from './utils/honeypot.server.tsx'
import { buildMeta } from './utils/meta.ts'
import { getOrigin } from './utils/misc.ts'
import { useNonce } from './utils/nonce-provider.tsx'
import { getFormData, mergeHeaders } from './utils/request.server.ts'
import { setTheme, getTheme, type Theme } from './utils/theme.server.ts'
import { SET_THEME_INTENT, useOptionalTheme } from './utils/theme.tsx'
import { ServerTiming } from './utils/timings.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useToast } from './utils/toast.ts'

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
	// document has authed personalized content
	args.loaderHeaders.append('Cache-Control', 'private')
	args.loaderHeaders.append('Vary', 'Cookie')

	return pipeHeaders(args)
}

export const loader = async ({ request }: Route.LoaderArgs) => {
	forceEnvValidation()

	const timing = new ServerTiming()

	timing.time('get user id', 'Get user id in database')
	const userId = await getUserId(request)
	timing.timeEnd('get user id')

	timing.time('find user', 'Find user in database')
	const user = userId ? await getUser(userId) : null
	timing.timeEnd('find user')

	if (userId && !user) {
		console.info('something weird happened')
		await logout({ request })
	}

	const [[csrfToken, csrfCookieHeader], toast, honeyProps] = await Promise.all([
		csrf.commitToken(),
		getToast(request),
		honeypot.getInputProps(),
	])

	const headers = new Headers()
	mergeHeaders(headers, toast?.discardHeaders)
	csrfCookieHeader && headers.append('set-cookie', csrfCookieHeader)

	headers.append('Server-Timing', timing.toString())
	return data(
		{
			user,
			env: publicEnv,
			requestInfo: {
				origin: getOrigin(request),
				hints: getHints(request),
				userPreferences: {
					theme: getTheme(request),
				},
			},
			toast: toast?.toast,
			csrfToken,
			honeyProps,
		},
		{
			headers,
		},
	)
}

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await getFormData(request)
	const intent = formData.get('intent')

	switch (intent) {
		case SET_THEME_INTENT: {
			return setTheme(formData)
		}
		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

function Document({
	children,
	nonce,
	theme = 'light',
	env,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: PublicEnv
}) {
	const allowIndexing = env?.ALLOW_INDEXING

	return (
		<html lang="en" className={clsx(theme, 'relative')}>
			<head>
				<ClientHintsCheck nonce={nonce} />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{!allowIndexing && <meta name="robots" content="noindex, nofollow" />}
				<FaviconMeta />

				<Meta />
				<Links />
			</head>
			<body
				className="bg-background text-foreground transition-colors"
				suppressHydrationWarning
			>
				{children}

				<NavProgress />
				<Toaster theme={theme} />

				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env ?? {})}`,
					}}
				/>
				<Scripts nonce={nonce} />
				<ScrollRestoration nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	useToast(data.toast)

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
	const { csrfToken, honeyProps } = useLoaderData<typeof loader>()

	return (
		<HoneypotProvider {...honeyProps}>
			<AuthenticityTokenProvider token={csrfToken}>
				<OpenImgContextProvider optimizerEndpoint="/resources/images">
					<TooltipProvider>
						<App />
					</TooltipProvider>
				</OpenImgContextProvider>
			</AuthenticityTokenProvider>
		</HoneypotProvider>
	)
}

export default AppWithProviders

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>('root')
	const nonce = useNonce()
	const theme = useOptionalTheme()

	return (
		<Document nonce={nonce} env={data?.env} theme={theme}>
			{children}
		</Document>
	)
}

export const ErrorBoundary = GeneralErrorBoundary
