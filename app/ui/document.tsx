import type { Handle, RemixNode } from 'remix/ui'
import { unsafeHTML } from 'remix/ui'
import { ImportMap } from 'remix/ui/server'

import { scriptEntry, stylesheetHref } from '../assets.ts'
import { site } from './site.ts'

export interface DocumentProps {
	children?: RemixNode
	title?: string
	description?: string
	/** Canonical path, e.g. `/articles`. */
	path?: string
	type?: 'website' | 'article'
}

// Runs before first paint so the stored/system theme never flashes.
const themeScript = `(()=>{try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`

const fontsHref =
	'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&family=Pixelify+Sans:wght@400;500;700&family=Silkscreen&display=swap'

export function Document(handle: Handle<DocumentProps>) {
	return () => {
		let {
			children,
			title,
			description = site.description,
			path = '/',
			type = 'website',
		} = handle.props
		let fullTitle = title ? `${title} · ${site.name}` : `${site.author} · ${site.name}`
		let url = new URL(path, site.url).href
		let { href, importMap, preloads } = scriptEntry

		return (
			<html lang="en" data-theme="light">
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<title>{fullTitle}</title>
					<meta name="description" content={description} />
					<link rel="canonical" href={url} />
					<meta property="og:type" content={type} />
					<meta property="og:site_name" content={site.name} />
					<meta property="og:title" content={fullTitle} />
					<meta property="og:description" content={description} />
					<meta property="og:url" content={url} />
					<meta name="twitter:card" content="summary" />
					<meta name="theme-color" content="#f6efdc" media="(prefers-color-scheme: light)" />
					<meta name="theme-color" content="#15122b" media="(prefers-color-scheme: dark)" />
					<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
					<link rel="icon" href="/favicon.ico" sizes="32x32" />
					<link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
					<link rel="manifest" href="/site.webmanifest" />
					<script innerHTML={unsafeHTML(themeScript)} />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link rel="stylesheet" href={fontsHref} />
					<link rel="stylesheet" href={stylesheetHref} />
					<ImportMap value={importMap} />
					{preloads.map((preloadHref) => (
						<link key={preloadHref} rel="modulepreload" href={preloadHref} />
					))}
					<script type="module" src={href}></script>
				</head>
				<body>{children}</body>
			</html>
		)
	}
}
