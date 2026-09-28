import type { Handle, RemixNode } from 'remix/ui'
import { unsafeHTML } from 'remix/ui'
import { ImportMap } from 'remix/ui/server'

import { scriptEntry, stylesheetHref } from '../assets.ts'
import { absoluteUrl, site } from '../content/site.ts'
import { currentTheme } from '../middleware/theme.ts'
import { routes } from '../routes.ts'

export interface PageMeta {
	/** Page title without the site name; omit on the home page. */
	title?: string
	description?: string
	/** Canonical path, e.g. `/articles`. */
	path: string
	type?: 'website' | 'article'
	/** ISO date, for articles. */
	publishedTime?: string
	/** Structured data for search engines. */
	jsonLd?: Record<string, unknown>
	/** Keep the page out of search results (404s). */
	noindex?: boolean
}

const fontsHref =
	'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=JetBrains+Mono:wght@400;600&family=Karla:ital,wght@0,400;0,600;0,700;1,400&display=swap'

/**
 * Switches on the "draw in" states before first paint, and switches them off
 * again if the page scripts never start (blocked, offline, or broken), so
 * content is never left hidden. `#js` keeps its state across client
 * navigations because Remix preserves its DOM.
 */
const jsGateScript = `(()=>{let g=document.getElementById('js');g.dataset.on='';setTimeout(()=>{if(!window.__pencil)delete g.dataset.on},3000)})()`

function jsonLdScript(value: Record<string, unknown>) {
	// `<` is escaped so the data can never close the script element.
	return unsafeHTML(JSON.stringify(value).replace(/</g, '\\u003c'))
}

export function Document(handle: Handle<{ meta: PageMeta; children?: RemixNode }>) {
	return () => {
		let { meta, children } = handle.props
		let { title, description = site.description, path, type = 'website' } = meta
		let fullTitle = title ? `${title} · ${site.name}` : `${site.author} · ${site.name}`
		let url = absoluteUrl(path)
		let theme = currentTheme()
		let { href, importMap, preloads } = scriptEntry

		return (
			<html lang="en" data-theme={theme ?? undefined}>
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
					<title>{fullTitle}</title>
					<meta name="description" content={description} />
					<meta name="author" content={site.author} />
					{meta.noindex ? <meta name="robots" content="noindex" /> : null}
					<link rel="canonical" href={url} />
					<meta property="og:type" content={type} />
					<meta property="og:site_name" content={site.name} />
					<meta property="og:title" content={fullTitle} />
					<meta property="og:description" content={description} />
					<meta property="og:url" content={url} />
					<meta property="og:locale" content="en_US" />
					{meta.publishedTime ? (
						<meta property="article:published_time" content={meta.publishedTime} />
					) : null}
					<meta name="twitter:card" content="summary" />
					<meta name="twitter:title" content={fullTitle} />
					<meta name="twitter:description" content={description} />
					<meta name="color-scheme" content={theme ?? 'light dark'} />
					<meta name="theme-color" content="#f4f3ef" media="(prefers-color-scheme: light)" />
					<meta name="theme-color" content="#161615" media="(prefers-color-scheme: dark)" />
					<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
					<link rel="icon" href="/favicon.ico" sizes="32x32" />
					<link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
					<link rel="manifest" href="/site.webmanifest" />
					<link
						rel="alternate"
						type="application/rss+xml"
						title={`${site.name} articles`}
						href={routes.articles.feed.href()}
					/>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link rel="stylesheet" href={fontsHref} />
					<link rel="stylesheet" href={stylesheetHref} />
					{meta.jsonLd ? (
						<script type="application/ld+json" innerHTML={jsonLdScript(meta.jsonLd)} />
					) : null}
					<ImportMap value={importMap} />
					{preloads.map((preloadHref) => (
						<link key={preloadHref} rel="modulepreload" href={preloadHref} />
					))}
					<script type="module" src={href}></script>
				</head>
				<body>
					<div id="js" hidden data-rmx-key="js" data-rmx-preserve-dom />
					<script innerHTML={unsafeHTML(jsGateScript)} />
					{children}
				</body>
			</html>
		)
	}
}
