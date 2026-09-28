import { css } from 'remix/ui'
import type { Handle, RemixNode } from 'remix/ui'

import { Sketch } from './public/sketch.tsx'

/** A section title with a pencil underline that runs a little past the text. */
export function SectionHeading(handle: Handle<{ id: string; seed: number; children?: RemixNode }>) {
	return () => (
		<h2 id={handle.props.id} mix={sectionHeadingStyle}>
			<span data-ink>{handle.props.children}</span>
			<Sketch
				shape="underline"
				seed={handle.props.seed}
				width={240}
				height={14}
				className="uline"
			/>
		</h2>
	)
}

export interface PageHeaderProps {
	title: string
	/** A short line above the title, like a date or a category. */
	eyebrow?: RemixNode
	/** A line below the title. */
	lede?: RemixNode
	seed: number
}

/** The top of every page but home: small line, big handwritten title, underline. */
export function PageHeader(handle: Handle<PageHeaderProps>) {
	return () => {
		let { title, eyebrow, lede, seed } = handle.props
		return (
			<header mix={pageHeaderStyle}>
				{eyebrow ? (
					<p className="eyebrow" data-ink>
						{eyebrow}
					</p>
				) : null}
				<h1>
					<span data-ink style="--d: 120ms">
						{title}
					</span>
					<Sketch shape="underline" seed={seed} width={480} height={16} className="uline" />
				</h1>
				{lede ? (
					<p className="lede" data-ink style="--d: 300ms">
						{lede}
					</p>
				) : null}
			</header>
		)
	}
}

const sectionHeadingStyle = css({
	position: 'relative',
	width: 'fit-content',
	maxWidth: '100%',
	marginBottom: '2rem',
	fontWeight: 400,
	fontSize: 'var(--step-2)',
	lineHeight: 1.2,
	scrollMarginTop: '2rem',
	'& .uline': {
		position: 'absolute',
		left: '-4px',
		bottom: '-10px',
		width: 'calc(100% + 3rem)',
		maxWidth: 'calc(100% + 3rem)',
		height: '14px',
	},
})

const pageHeaderStyle = css({
	maxWidth: 'var(--measure)',
	marginBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
	'& .eyebrow': { marginBottom: '0.5rem', color: 'var(--ink-soft)' },
	'& h1': {
		position: 'relative',
		width: 'fit-content',
		maxWidth: '100%',
		fontWeight: 400,
		fontSize: 'var(--step-3)',
		lineHeight: 1.15,
		textWrap: 'balance',
	},
	'& h1 .uline': {
		position: 'absolute',
		left: '-4px',
		bottom: '-14px',
		width: 'calc(100% + 8px)',
		height: '16px',
	},
	'& .lede': {
		marginTop: '2rem',
		fontFamily: 'var(--font-body)',
		fontSize: 'var(--step-1)',
		lineHeight: 1.6,
		color: 'var(--ink-soft)',
	},
})
