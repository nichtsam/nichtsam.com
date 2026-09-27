import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import { Layout } from '../ui/layout.tsx'
import { CrumpledPage } from '../ui/public/crumpled-page.tsx'

export function NotFoundPage(handle: Handle<{ pathname: string }>) {
	return () => (
		<Layout title="Page not found" path={handle.props.pathname}>
			<section mix={notFoundStyle}>
				<p className="code">404</p>
				<h1>Oops, crumpled.</h1>
				<CrumpledPage pathname={handle.props.pathname} homeHref={routes.home.href()} />
			</section>
		</Layout>
	)
}

const notFoundStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '16px',
	paddingBlock: '16px',
	textAlign: 'center',
	'& .code': {
		fontFamily: 'var(--font-hand)',
		fontSize: '2rem',
		fontWeight: 700,
		color: 'var(--pen-red)',
		transform: 'rotate(-6deg)',
	},
	'& h1': {
		fontFamily: 'var(--font-hand)',
		fontSize: 'clamp(3rem, 10vw, 5.5rem)',
		fontWeight: 700,
		lineHeight: 0.9,
	},
})
