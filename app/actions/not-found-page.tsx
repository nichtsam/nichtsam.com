import { css } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import { PageHeader } from '../ui/headings.tsx'
import { Layout } from '../ui/layout.tsx'
import { Doodle } from '../ui/public/sketch.tsx'

export function NotFoundPage(handle: Handle<{ pathname: string }>) {
	return () => (
		<Layout meta={{ title: 'Not found', path: handle.props.pathname, noindex: true }}>
			<div mix={notFoundStyle}>
				<Doodle name="eraser" className="eraser" />
				<PageHeader
					title="Nothing drawn here yet."
					eyebrow="404"
					lede={
						<>
							There's no page at <code>{handle.props.pathname}</code>. It may have been erased, or
							it was never drawn.
						</>
					}
					seed={91}
				/>
				<p data-ink>
					<a className="pencil-link" href={routes.home.href()}>
						← Back to the start
					</a>
				</p>
			</div>
		</Layout>
	)
}

const notFoundStyle = css({
	'& .eraser': { width: 'min(12rem, 50%)', height: 'auto', marginBottom: '1.5rem' },
	'& code': { fontFamily: 'var(--font-mono)', fontSize: '0.85em', wordBreak: 'break-all' },
})
