import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'
import { ContinueCountdown } from '../ui/public/continue-countdown.tsx'
import { PixelArt } from '../ui/public/pixel.tsx'
import { samIdle } from '../ui/public/sprites.ts'

export function NotFoundPage(handle: Handle<{ pathname: string }>) {
	return () => (
		<Layout title="Page not found" path={handle.props.pathname}>
			<section mix={notFoundStyle}>
				<p className="code">Error 404</p>
				<h1>Game over</h1>
				<div className="scene" aria-hidden="true">
					<PixelArt sprite={samIdle} />
				</div>
				<p className="message">
					There's nothing at <code>{handle.props.pathname}</code>. Maybe it was never here, or maybe
					it respawned somewhere else.
				</p>
				<ContinueCountdown homeHref={routes.home.href()} />
			</section>
		</Layout>
	)
}

const notFoundStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '20px',
	paddingBlock: '24px',
	textAlign: 'center',
	'& .code': {
		fontFamily: 'var(--font-label)',
		color: 'var(--accent)',
	},
	'& h1': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(3rem, 12vw, 7rem)',
		fontWeight: 700,
		lineHeight: 0.9,
		textTransform: 'uppercase',
		textShadow: '6px 6px 0 var(--accent)',
	},
	'& .scene': {
		width: '96px',
		transform: 'rotate(90deg)',
		opacity: 0.85,
		marginBlock: '12px',
	},
	'& .scene svg': { width: '100%', height: 'auto' },
	'& .message': {
		maxWidth: '32rem',
		color: 'var(--ink-soft)',
	},
	'& code': {
		padding: '0 6px',
		background: 'var(--surface-2)',
		boxShadow: '0 0 0 2px var(--line)',
		wordBreak: 'break-all',
	},
})
