import { css } from 'remix/ui'
import type { Handle, RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document, type DocumentProps } from './document.tsx'
import { Icon, Scribble } from './icons.tsx'
import { Effects } from './public/effects.tsx'
import { ThemeToggle } from './public/theme-toggle.tsx'
import { site } from './site.ts'

export interface LayoutProps extends DocumentProps {
	children?: RemixNode
	current?: 'home' | 'articles'
	/** Let the page's first section run edge to edge (the street scene). */
	wide?: RemixNode
}

export function Layout(handle: Handle<LayoutProps>) {
	return () => {
		let { children, current, wide, ...documentProps } = handle.props
		let navLink = (key: string, label: string, href: string, external = false) => (
			<a
				href={href}
				aria-current={current === key ? 'page' : undefined}
				target={external ? '_blank' : undefined}
				rel={external ? 'noreferrer' : undefined}
			>
				{label}
				{current === key && <Scribble className="scribble current-line" seed={label.length} />}
			</a>
		)
		return (
			<Document {...documentProps}>
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<header mix={headerStyle}>
					<nav aria-label="Main" className="side left">
						{navLink('home', 'Home', routes.home.href())}
						{navLink('articles', 'Articles', routes.articles.index.href())}
					</nav>
					<a className="tab" href={routes.home.href()} aria-label={`${site.name}, home`}>
						<span>{site.name}</span>
					</a>
					<nav aria-label="Elsewhere" className="side right">
						{navLink('github', 'GitHub', site.social.github, true)}
						{navLink('linkedin', 'LinkedIn', site.social.linkedin, true)}
						<ThemeToggle sun={<Icon name="sun" seed={4} />} moon={<Icon name="moon" seed={8} />} />
					</nav>
				</header>
				{wide}
				<div mix={shellStyle}>
					<main id="main" tabIndex={-1} mix={mainStyle}>
						{children}
					</main>
				</div>
				<footer mix={footerStyle}>
					<div className="inner">
						<div className="col">
							<p className="head">pages</p>
							<ul>
								<li>
									<a href={routes.home.href()}>home</a>
								</li>
								<li>
									<a href={routes.articles.index.href()}>articles</a>
								</li>
								<li>
									<a href={routes.sitemap.href()}>sitemap</a>
								</li>
							</ul>
						</div>
						<div className="col">
							<p className="head">elsewhere</p>
							<ul>
								<li>
									<a href={site.social.github} target="_blank" rel="noreferrer">
										github
									</a>
								</li>
								<li>
									<a href={site.social.linkedin} target="_blank" rel="noreferrer">
										linkedin
									</a>
								</li>
							</ul>
						</div>
						<div className="col signoff">
							<Icon name="house" className="house" seed={12} />
							<p>
								drawn by {site.author}
								<br />
								{new Date().getFullYear()} · built with Remix 3
							</p>
						</div>
					</div>
				</footer>
				<Effects />
			</Document>
		)
	}
}

const headerStyle = css({
	position: 'relative',
	zIndex: 5,
	display: 'grid',
	gridTemplateColumns: '1fr auto 1fr',
	alignItems: 'start',
	gap: '24px',
	maxWidth: '1180px',
	marginInline: 'auto',
	paddingInline: '20px',
	'& .side': {
		display: 'flex',
		alignItems: 'center',
		gap: '28px',
		height: '46px',
		marginTop: '20px',
	},
	'& .left': { justifyContent: 'flex-end' },
	'& .right': { justifyContent: 'flex-start' },
	'& .side a': {
		position: 'relative',
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.8rem',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		textDecoration: 'none',
	},
	'& .side a:hover': { color: 'var(--accent)' },
	'& .current-line': {
		position: 'absolute',
		left: '-4px',
		right: '-4px',
		bottom: '-8px',
		width: 'calc(100% + 8px)',
		height: '8px',
	},
	'& .tab': {
		display: 'grid',
		placeItems: 'center',
		minWidth: '170px',
		padding: '26px 28px 22px',
		background: 'var(--tab)',
		color: 'var(--tab-ink)',
		textDecoration: 'none',
		borderRadius: '0 0 6px 6px',
		boxShadow: '0 6px 18px -8px rgb(0 0 0 / 0.5)',
		transition: 'padding 200ms ease',
	},
	'& .tab span': {
		fontFamily: 'var(--font-hand)',
		fontSize: '2.1rem',
		lineHeight: 1,
		transform: 'rotate(-4deg)',
	},
	'& .tab:hover': { paddingTop: '34px' },
	'@media (max-width: 760px)': {
		gridTemplateColumns: 'auto 1fr',
		gap: '0 16px',
		'& .tab': { gridColumn: '1', gridRow: '1 / span 2', minWidth: 0, padding: '20px 18px 16px' },
		'& .tab span': { fontSize: '1.6rem' },
		'& .side': {
			height: 'auto',
			marginTop: '10px',
			gap: '16px',
			justifyContent: 'flex-end',
			flexWrap: 'wrap',
		},
		'& .left': { gridColumn: '2' },
		'& .right': { gridColumn: '2' },
	},
})

const shellStyle = css({
	width: '100%',
	maxWidth: '1040px',
	marginInline: 'auto',
	paddingInline: '20px',
})

const mainStyle = css({
	paddingBlock: '40px 80px',
	minHeight: '50vh',
	'&:focus': { outline: 'none' },
})

const footerStyle = css({
	borderTop: '2px solid var(--ink)',
	fontFamily: 'var(--font-hand)',
	'& .inner': {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		gap: '24px',
		maxWidth: '1040px',
		marginInline: 'auto',
		padding: '28px 20px 40px',
	},
	'& .head': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.75rem',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		marginBottom: '6px',
	},
	'& ul': { listStyle: 'none', padding: 0 },
	'& li::before': { content: '"▸ "', fontSize: '0.8em' },
	'& a': { textDecoration: 'none' },
	'& a:hover': { textDecoration: 'underline wavy', textUnderlineOffset: '4px' },
	'& .signoff': {
		display: 'flex',
		alignItems: 'flex-start',
		gap: '12px',
		color: 'var(--ink-soft)',
	},
	'& .house': { width: '40px', height: '40px', flex: 'none', color: 'var(--ink)' },
	'@media (max-width: 600px)': {
		'& .inner': { gridTemplateColumns: '1fr 1fr' },
		'& .signoff': { gridColumn: '1 / -1' },
	},
})
