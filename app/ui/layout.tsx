import { css } from 'remix/ui'
import type { Handle, RemixNode } from 'remix/ui'

import { site } from '../content/site.ts'
import { currentTheme } from '../middleware/theme.ts'
import { routes } from '../routes.ts'
import { Document, type PageMeta } from './document.tsx'
import { Ink } from './public/ink.tsx'
import { PageTransition } from './public/page-transition.tsx'
import { Doodle, Sketch } from './public/sketch.tsx'
import { ThemeToggle } from './public/theme-toggle.tsx'

export type Section = 'home' | 'about' | 'projects' | 'articles'

const nav: Array<{ key: Section; label: string; href: string }> = [
	{ key: 'home', label: 'Home', href: routes.home.href() },
	{ key: 'about', label: 'About', href: routes.about.href() },
	{ key: 'projects', label: 'Projects', href: routes.projects.index.href() },
	{ key: 'articles', label: 'Articles', href: routes.articles.index.href() },
]

export interface LayoutProps {
	meta: PageMeta
	/** The nav item to mark as current. */
	section?: Section
	children?: RemixNode
}

/** Every page: one sheet of paper with the header, the page and the footer drawn on it. */
export function Layout(handle: Handle<LayoutProps>) {
	return () => {
		let { meta, section, children } = handle.props
		return (
			<Document meta={meta}>
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<div mix={sheetStyle}>
					<Sketch shape="sheet" seed={1} width={1152} height={2400} className="sheet-frame" />
					<header mix={headerStyle}>
						<a className="logo" href={routes.home.href()} aria-label={`${site.name}, home`}>
							<span data-ink>{site.name}</span>
						</a>
						<nav aria-label="Main">
							<ul>
								{nav.map((item, i) => {
									let current = item.key === section
									return (
										<li key={item.key}>
											<a href={item.href} aria-current={current ? 'page' : undefined}>
												<span data-ink style={`--d: ${120 + i * 60}ms`}>
													{item.label}
												</span>
												{current ? (
													<Sketch
														shape="nav"
														seed={20 + i}
														width={80}
														height={10}
														className="nav-line"
													/>
												) : null}
											</a>
										</li>
									)
								})}
							</ul>
						</nav>
						<ThemeToggle theme={currentTheme()} action={routes.theme.href()} returnTo={meta.path} />
					</header>
					<main id="main" tabIndex={-1} mix={mainStyle}>
						{children}
					</main>
					<Footer />
				</div>
				<Ink />
				<PageTransition />
			</Document>
		)
	}
}

function Footer() {
	return () => (
		<footer mix={footerStyle}>
			<Sketch shape="divider" seed={9} width={1152} height={10} className="divider" />
			<nav aria-label="Pages">
				<ul>
					{nav.slice(1).map((item, i) => (
						<li key={item.key} data-ink style={`--d: ${i * 80}ms`}>
							<Doodle name="triangle" className="mark" ink={false} />
							<a className="pencil-link" href={item.href}>
								{item.label}
							</a>
						</li>
					))}
				</ul>
			</nav>
			<nav aria-label="Elsewhere">
				<ul>
					<li data-ink style="--d: 100ms">
						<Doodle name="bullet" className="mark" ink={false} />
						<a className="pencil-link" href={site.social.github} rel="me noreferrer">
							GitHub
						</a>
					</li>
					<li data-ink style="--d: 180ms">
						<Doodle name="bullet" className="mark" ink={false} />
						<a className="pencil-link" href={site.social.linkedin} rel="me noreferrer">
							LinkedIn
						</a>
					</li>
					<li data-ink style="--d: 260ms">
						<Doodle name="bullet" className="mark" ink={false} />
						<a className="pencil-link" href={routes.articles.feed.href()}>
							RSS
						</a>
					</li>
				</ul>
			</nav>
			<p className="colophon" data-ink style="--d: 200ms">
				<Doodle name="house" className="house" ink={false} />
				<span>
					© {new Date().getFullYear()} {site.author}
					<br />
					drawn in pencil, mostly
				</span>
			</p>
		</footer>
	)
}

const sheetStyle = css({
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	minHeight: 'calc(100svh - 2 * var(--sheet-margin))',
	width: 'min(100% - 2 * var(--sheet-margin), var(--sheet-max))',
	margin: 'var(--sheet-margin) auto',
	padding: 'clamp(1.75rem, 1rem + 2vw, 2.5rem) var(--gutter) 0',
	'--sheet-margin': 'clamp(8px, 2vw, 28px)',
	'--gutter': 'clamp(1.9rem, 1rem + 3.5vw, 4rem)',
	'& > .sheet-frame': {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
	},
})

const headerStyle = css({
	position: 'relative',
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: '0 1.25rem',
	marginBottom: 'clamp(2rem, 1rem + 3vw, 3.5rem)',
	'& > .logo': {
		display: 'inline-flex',
		alignItems: 'center',
		minHeight: '44px',
		fontSize: 'clamp(1.5rem, 1.3rem + 0.8vw, 1.8rem)',
		lineHeight: 1,
	},
	'& .logo:hover': { color: 'var(--accent)' },
	'& .logo': { marginRight: 'auto' },
	'& nav': { order: 3, flexBasis: '100%' },
	'@media (min-width: 40rem)': {
		'& nav': { order: 0, flexBasis: 'auto' },
	},
	'& ul': {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '0 clamp(0.75rem, 0.2rem + 1.6vw, 1.75rem)',
		padding: 0,
		listStyle: 'none',
	},
	'& ul a': {
		position: 'relative',
		display: 'inline-flex',
		alignItems: 'center',
		minHeight: '44px',
		fontSize: 'var(--step-1)',
	},
	'& ul a:hover': { color: 'var(--accent)' },
	'& .nav-line': {
		position: 'absolute',
		left: '-4px',
		bottom: '4px',
		width: 'calc(100% + 8px)',
		height: '10px',
	},
})

const mainStyle = css({
	flex: 1,
	'&:focus': { outline: 'none' },
})

const footerStyle = css({
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	gap: '1.25rem 2.5rem',
	margin: 'clamp(4rem, 2rem + 6vw, 7rem) calc(-1 * var(--gutter)) 0',
	padding: '2rem var(--gutter) clamp(2rem, 1.5rem + 2vw, 3rem)',
	fontSize: 'var(--step--1)',
	'& > .divider': {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '10px',
	},
	'& ul': { padding: 0, listStyle: 'none' },
	'& li': { display: 'flex', alignItems: 'center', gap: '0.6rem', minHeight: '2rem' },
	'& .mark': { flex: 'none', width: '12px', height: '12px' },
	'& .colophon': {
		display: 'flex',
		alignItems: 'flex-start',
		gap: '0.75rem',
		color: 'var(--ink-soft)',
	},
	'& .house': { flex: 'none', width: '30px', height: '30px' },
	'@media (max-width: 40rem)': {
		gridTemplateColumns: 'minmax(0, 1fr)',
	},
})
