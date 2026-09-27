import { clientEntry, css, navigate, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { prefersReducedMotion } from './theme.ts'

/** A crumpled-up ball of paper that unfolds into the 404 message. */
export const CrumpledPage = clientEntry(
	import.meta.url,
	function CrumpledPage(handle: Handle<{ pathname: string; homeHref: string }>) {
		let unfolded = false
		let flying = false

		function fly() {
			flying = true
			handle.update()
			window.setTimeout(
				() => void navigate(handle.props.homeHref),
				prefersReducedMotion() ? 0 : 900,
			)
		}

		return () => {
			let { pathname, homeHref } = handle.props
			return (
				<div mix={crumpleStyle}>
					{!unfolded ? (
						<button
							type="button"
							className="ball"
							aria-label="Unfold the crumpled page"
							mix={on('click', () => {
								unfolded = true
								handle.update()
							})}
						>
							<svg viewBox="0 0 200 180" aria-hidden="true" className="boil">
								<path
									d="M40 60 L 70 22 L 118 14 L 160 40 L 184 86 L 166 138 L 118 166 L 64 160 L 22 124 L 18 84 Z"
									fill="var(--card)"
									stroke="currentColor"
									strokeWidth={3}
									strokeLinejoin="round"
								/>
								<path
									d="M70 22 L 88 70 L 40 60 M88 70 L 118 14 M88 70 L 140 92 L 160 40 M140 92 L 184 86 M140 92 L 118 166 M88 70 L 64 110 L 22 124 M64 110 L 118 166 M64 110 L 18 84 M140 92 L 166 138"
									fill="none"
									stroke="currentColor"
									strokeWidth={1.6}
									strokeLinecap="round"
									opacity={0.55}
								/>
								<path
									d="M96 104 l 10 -4 M100 120 l 14 2 M60 80 l 8 6"
									stroke="var(--pen-blue)"
									strokeWidth={2}
									strokeLinecap="round"
								/>
							</svg>
							<span className="tap">(click to unfold)</span>
						</button>
					) : (
						<div className={flying ? 'sheet is-flying' : 'sheet'}>
							<p className="big">This page got torn out.</p>
							<p>
								There's nothing at <code>{pathname}</code>. Maybe I never wrote it, or maybe I
								crumpled it up and threw it at the bin. (I missed.)
							</p>
							<button type="button" className="plane" mix={on('click', fly)}>
								fold it into a paper plane &amp; fly home ✈
							</button>
						</div>
					)}
					<a className="plain" href={homeHref}>
						or just walk back home
					</a>
				</div>
			)
		}
	},
)

const crumpleStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '24px',
	'& .ball': {
		display: 'grid',
		justifyItems: 'center',
		gap: '6px',
		padding: 0,
		border: 0,
		background: 'transparent',
		color: 'var(--ink)',
	},
	'& .ball svg': {
		width: 'min(220px, 60vw)',
		height: 'auto',
		animation: 'roll 3s ease-in-out infinite',
		filter: 'drop-shadow(4px 8px 0 var(--shadow))',
	},
	'& .ball:hover svg': { animationDuration: '0.8s' },
	'& .tap': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.5rem',
		color: 'var(--ink-soft)',
	},
	'& .sheet': {
		display: 'grid',
		gap: '16px',
		maxWidth: '34rem',
		padding: '32px 36px',
		background: 'var(--card)',
		boxShadow: '4px 8px 0 var(--shadow)',
		// crease marks
		backgroundImage:
			'linear-gradient(120deg, transparent 49.6%, rgb(0 0 0 / 0.06) 50%, transparent 50.4%), linear-gradient(35deg, transparent 49.6%, rgb(0 0 0 / 0.05) 50%, transparent 50.4%), linear-gradient(80deg, transparent 49.6%, rgb(0 0 0 / 0.05) 50%, transparent 50.4%)',
		clipPath:
			'polygon(1% 2%, 30% 0, 62% 2%, 99% 0, 100% 40%, 98% 72%, 100% 99%, 64% 98%, 32% 100%, 0 98%, 2% 64%, 0 30%)',
		animation: 'unfold 450ms cubic-bezier(.3,1.4,.5,1)',
		textAlign: 'left',
	},
	'& .sheet.is-flying': {
		animation: 'fly 900ms ease-in forwards',
	},
	'& .big': {
		fontFamily: 'var(--font-hand)',
		fontSize: '2.4rem',
		fontWeight: 700,
		lineHeight: 1,
		color: 'var(--pen-red)',
	},
	'& code': {
		fontFamily: 'var(--font-mono)',
		fontSize: '0.85em',
		padding: '0 6px',
		background: 'var(--hl-yellow)',
		color: 'var(--hl-ink)',
		wordBreak: 'break-all',
	},
	'& .plane': {
		justifySelf: 'start',
		padding: '4px 16px',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.5rem',
		fontWeight: 700,
		background: 'transparent',
		border: '2px solid var(--ink)',
		borderRadius: 'var(--sketch-radius)',
	},
	'& .plane:hover': { background: 'var(--hl-yellow)', color: 'var(--hl-ink)' },
	'& .plain': {
		fontFamily: 'var(--font-note)',
		fontSize: '1.1rem',
		color: 'var(--ink-soft)',
	},
	'@keyframes roll': {
		'0%, 100%': { transform: 'rotate(-6deg)' },
		'50%': { transform: 'rotate(6deg) translateY(-6px)' },
	},
	'@keyframes unfold': {
		from: { transform: 'scale(0.3) rotate(-20deg)', opacity: 0 },
		to: { transform: 'scale(1) rotate(0)', opacity: 1 },
	},
	'@keyframes fly': {
		'30%': { transform: 'scale(0.5, 0.25) rotate(-10deg)' },
		to: { transform: 'translate(120vw, -80vh) scale(0.2) rotate(-30deg)', opacity: 0 },
	},
})
