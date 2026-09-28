import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import { Scribble } from '../ui/icons.tsx'
import { Layout } from '../ui/layout.tsx'
import { createPen, InkPaths } from '../ui/sketch.tsx'

/** A 404 drawn as an unfinished wireframe. */
export function NotFoundPage(handle: Handle<{ pathname: string }>) {
	return () => {
		let pen = createPen({ seed: 404, roughness: 1.5 })
		let placeholder = [
			...pen.rect(6, 6, 388, 188, { strokeWidth: 2 }),
			...pen.line(10, 10, 390, 190, { thin: true }),
			...pen.line(390, 10, 10, 190, { thin: true }),
		]
		return (
			<Layout title="Page not found" path={handle.props.pathname}>
				<section mix={notFoundStyle}>
					<p className="code">Error 404</p>
					<h1>This page is still a wireframe.</h1>
					<div className="mock frame">
						<svg
							className="placeholder"
							viewBox="0 0 400 200"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<InkPaths ink={placeholder} />
						</svg>
						<div className="lines" aria-hidden="true">
							{[1, 2, 3, 4].map((n) => (
								<Scribble className="scribble fake" seed={n * 7} />
							))}
						</div>
					</div>
					<p className="message">
						Nobody has drawn anything at <code>{handle.props.pathname}</code> yet. Maybe later,
						maybe never.
					</p>
					<a className="home frame frame-hover" href={routes.home.href()}>
						← back to the street
					</a>
				</section>
			</Layout>
		)
	}
}

const notFoundStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '18px',
	textAlign: 'center',
	'& .code': {
		fontFamily: 'var(--font-sign)',
		fontWeight: 800,
		fontSize: '0.8rem',
		letterSpacing: '0.12em',
		textTransform: 'uppercase',
		color: 'var(--accent)',
	},
	'& h1': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 400,
		fontSize: 'clamp(2.2rem, 7vw, 3.6rem)',
		lineHeight: 1.1,
		textWrap: 'balance',
	},
	'& .mock': {
		display: 'grid',
		gap: '14px',
		width: 'min(520px, 100%)',
		padding: '14px',
	},
	'& .placeholder': { width: '100%', height: '180px' },
	'& .placeholder path': { vectorEffect: 'non-scaling-stroke' },
	'& .lines': { display: 'grid', gap: '10px' },
	'& .fake': { height: '8px' },
	'& .fake:nth-child(2)': { width: '85%' },
	'& .fake:nth-child(4)': { width: '60%' },
	'& .message': { maxWidth: '32rem', color: 'var(--ink-soft)' },
	'& code': { fontFamily: 'var(--font-mono)', fontSize: '0.85em', wordBreak: 'break-all' },
	'& .home': {
		padding: '4px 18px',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.3rem',
		textDecoration: 'none',
	},
})
