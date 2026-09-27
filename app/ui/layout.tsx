import { css } from 'remix/ui'
import type { Handle, RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document, type DocumentProps } from './document.tsx'
import {
	CircleScribble,
	DoodleDefs,
	GithubDoodle,
	LinkedinDoodle,
	Underline,
} from './public/doodles.tsx'
import { Effects } from './public/effects.tsx'
import { ThemeToggle } from './public/theme-toggle.tsx'
import { site } from './site.ts'

export interface LayoutProps extends DocumentProps {
	children?: RemixNode
	current?: 'home' | 'articles'
}

export function Layout(handle: Handle<LayoutProps>) {
	return () => {
		let { children, current, ...documentProps } = handle.props
		let nav = [
			{ key: 'home', label: 'home', href: routes.home.href() },
			{ key: 'articles', label: 'articles', href: routes.articles.index.href() },
		]
		return (
			<Document {...documentProps}>
				<DoodleDefs />
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<div mix={shellStyle}>
					<header mix={headerStyle}>
						<a className="brand" href={routes.home.href()} aria-label={`${site.name} — home`}>
							<span className="brand-name">{site.name}</span>
							<Underline className="brand-line boil" />
						</a>
						<nav aria-label="Main">
							<ul>
								{nav.map((item) => (
									<li key={item.key}>
										<a href={item.href} aria-current={current === item.key ? 'page' : undefined}>
											{item.label}
											{current === item.key && <CircleScribble className="ring boil" />}
										</a>
									</li>
								))}
							</ul>
						</nav>
						<ThemeToggle />
					</header>
					<main id="main" tabIndex={-1} mix={mainStyle}>
						{children}
					</main>
					<footer mix={footerStyle}>
						<ul className="social">
							<li>
								<a href={site.social.github} target="_blank" rel="noreferrer" aria-label="GitHub">
									<GithubDoodle className="boil" />
								</a>
							</li>
							<li>
								<a
									href={site.social.linkedin}
									target="_blank"
									rel="noreferrer"
									aria-label="LinkedIn"
								>
									<LinkedinDoodle className="boil" />
								</a>
							</li>
						</ul>
						<p>
							scribbled by {site.author} · {new Date().getFullYear()} · built with Remix 3
						</p>
					</footer>
				</div>
				<Effects />
			</Document>
		)
	}
}

const shellStyle = css({
	display: 'flex',
	flexDirection: 'column',
	minHeight: '100dvh',
	width: '100%',
	maxWidth: '1040px',
	marginInline: 'auto',
	paddingInline: '20px',
})

const headerStyle = css({
	display: 'flex',
	alignItems: 'center',
	gap: '20px',
	paddingBlock: '18px',
	'& .brand': {
		position: 'relative',
		marginRight: 'auto',
		textDecoration: 'none',
		transform: 'rotate(-2deg)',
	},
	'& .brand-name': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 700,
		fontSize: '2.3rem',
		lineHeight: 1,
	},
	'& .brand-line': {
		position: 'absolute',
		left: '-4px',
		right: '-6px',
		bottom: '-8px',
		height: '12px',
		width: 'calc(100% + 10px)',
		color: 'var(--pen-red)',
	},
	'& .brand-line path': {
		strokeDasharray: 1,
		strokeDashoffset: 0,
	},
	'& .brand:hover .brand-line path': {
		animation: 'redraw 500ms ease-out',
	},
	'& nav ul': {
		display: 'flex',
		gap: '18px',
		listStyle: 'none',
		padding: 0,
	},
	'& nav a': {
		position: 'relative',
		display: 'block',
		padding: '2px 8px',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.6rem',
		fontWeight: 700,
		textDecoration: 'none',
	},
	'& nav a:hover': {
		color: 'var(--pen-red)',
	},
	'& nav .ring': {
		position: 'absolute',
		inset: '-4px -12px -2px -12px',
		width: 'calc(100% + 24px)',
		height: 'calc(100% + 6px)',
		color: 'var(--pen-red)',
		pointerEvents: 'none',
	},
	'& nav .ring path': {
		strokeDasharray: 1,
		strokeDashoffset: 1,
		animation: 'redraw 600ms 150ms ease-out forwards',
	},
	'@media (max-width: 480px)': {
		gap: '12px',
		'& nav ul': { gap: '6px' },
		'& .brand-name': { fontSize: '1.9rem' },
		'& nav a': { fontSize: '1.35rem' },
	},
	'@keyframes redraw': {
		from: { strokeDashoffset: 1 },
		to: { strokeDashoffset: 0 },
	},
})

const mainStyle = css({
	flex: '1 0 auto',
	paddingBlock: '24px 72px',
	'&:focus': { outline: 'none' },
})

const footerStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '6px',
	paddingBlock: '28px 40px',
	fontFamily: 'var(--font-note)',
	fontSize: '1.05rem',
	color: 'var(--ink-soft)',
	textAlign: 'center',
	backgroundImage: 'linear-gradient(90deg, var(--ink-soft) 50%, transparent 50%)',
	backgroundSize: '14px 2px',
	backgroundRepeat: 'repeat-x',
	backgroundPosition: 'top',
	'& .social': {
		display: 'flex',
		gap: '14px',
		listStyle: 'none',
		padding: 0,
	},
	'& .social a': {
		display: 'block',
		width: '44px',
		height: '44px',
		color: 'var(--ink)',
		transition: 'transform 160ms ease',
	},
	'& .social a:hover': {
		color: 'var(--pen-red)',
		transform: 'rotate(-10deg) scale(1.1)',
	},
	'& .social svg': { width: '100%', height: '100%' },
})
