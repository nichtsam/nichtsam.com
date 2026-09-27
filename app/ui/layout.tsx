import { css } from 'remix/ui'
import type { Handle, RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document, type DocumentProps } from './document.tsx'
import { Effects } from './public/effects.tsx'
import { PixelArt } from './public/pixel.tsx'
import { icons, samHead } from './public/sprites.ts'
import { ThemeToggle } from './public/theme-toggle.tsx'
import { site } from './site.ts'

export interface LayoutProps extends DocumentProps {
	children?: RemixNode
	/** Which nav item to mark as current. */
	current?: 'home' | 'articles'
}

export function Layout(handle: Handle<LayoutProps>) {
	return () => {
		let { children, current, ...documentProps } = handle.props
		return (
			<Document {...documentProps}>
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<div mix={shellStyle}>
					<header mix={headerStyle}>
						<a className="brand" href={routes.home.href()} aria-label={`${site.name} — home`}>
							<span className="brand-head">
								<PixelArt sprite={samHead} />
							</span>
							<span className="brand-name">{site.name}</span>
						</a>
						<nav aria-label="Main">
							<ul>
								<li>
									<a
										href={routes.home.href()}
										aria-current={current === 'home' ? 'page' : undefined}
									>
										Home
									</a>
								</li>
								<li>
									<a
										href={routes.articles.index.href()}
										aria-current={current === 'articles' ? 'page' : undefined}
									>
										Articles
									</a>
								</li>
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
									<PixelArt sprite={icons.github!} />
								</a>
							</li>
							<li>
								<a
									href={site.social.linkedin}
									target="_blank"
									rel="noreferrer"
									aria-label="LinkedIn"
								>
									<PixelArt sprite={icons.linkedin!} />
								</a>
							</li>
						</ul>
						<p>
							© {new Date().getFullYear()} {site.author} · Built with Remix 3
						</p>
						<p className="hint" aria-hidden="true">
							↑ ↑ ↓ ↓ ← → ← → B A
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
	gap: '16px',
	paddingBlock: '20px',
	'& .brand': {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginRight: 'auto',
		textDecoration: 'none',
	},
	'& .brand-head': {
		width: '40px',
		padding: '2px',
		background: 'var(--surface)',
		border: 'var(--px) solid var(--line)',
		boxShadow: '0 var(--px) 0 var(--shadow)',
	},
	'& .brand-head svg': { width: '100%', height: 'auto' },
	'& .brand:hover .brand-head': {
		animation: 'hop 360ms steps(3)',
	},
	'& .brand-name': {
		fontFamily: 'var(--font-display)',
		fontWeight: 700,
		fontSize: '1.5rem',
		letterSpacing: '0.02em',
	},
	'& nav ul': {
		display: 'flex',
		gap: '4px',
		listStyle: 'none',
		padding: 0,
	},
	'& nav a': {
		display: 'block',
		padding: '4px 12px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.875rem',
		textDecoration: 'none',
		border: 'var(--px) solid transparent',
	},
	'& nav a:hover': {
		borderColor: 'var(--line)',
		background: 'var(--surface)',
	},
	'& nav a[aria-current="page"]': {
		background: 'var(--ink)',
		color: 'var(--bg)',
		borderColor: 'var(--line)',
	},
	'@media (max-width: 480px)': {
		gap: '10px',
		'& .brand-name': { display: 'none' },
		'& nav a': { padding: '4px 8px' },
	},
	'@keyframes hop': {
		'50%': { transform: 'translateY(-6px)' },
	},
})

const mainStyle = css({
	flex: '1 0 auto',
	paddingBlock: '24px 64px',
	'&:focus': { outline: 'none' },
})

const footerStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '8px',
	paddingBlock: '32px 40px',
	borderTop: 'var(--px) dashed var(--ink-soft)',
	fontFamily: 'var(--font-label)',
	fontSize: '0.75rem',
	color: 'var(--ink-soft)',
	textAlign: 'center',
	'& .social': {
		display: 'flex',
		gap: '16px',
		listStyle: 'none',
		padding: 0,
	},
	'& .social a': {
		display: 'block',
		width: '40px',
		padding: '6px',
		color: 'var(--ink)',
		background: 'var(--surface)',
		border: 'var(--px) solid var(--line)',
		boxShadow: '0 var(--px) 0 var(--shadow)',
		transition: 'transform 80ms steps(2)',
	},
	'& .social a:hover': {
		background: 'var(--gold)',
		color: '#22203a',
		transform: 'translateY(-4px)',
	},
	'& .social svg': { width: '100%', height: 'auto' },
	'& .hint': {
		opacity: 0.35,
		letterSpacing: '0.2em',
	},
})
