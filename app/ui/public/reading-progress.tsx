import { clientEntry, css } from 'remix/ui'
import type { Handle } from 'remix/ui'

/**
 * A pencil that draws a line across the top of the page as you read, and
 * stamps "DONE" when you reach the end.
 */
export const ReadingProgress = clientEntry(
	import.meta.url,
	function ReadingProgress(handle: Handle<{ targetId: string }>) {
		let progress = 0
		let done = false
		let frame = 0

		handle.queueTask(() => {
			let measure = () => {
				frame = 0
				let target = document.getElementById(handle.props.targetId)
				if (!target) return
				let rect = target.getBoundingClientRect()
				let total = rect.height - window.innerHeight * 0.6
				let read = -rect.top + window.innerHeight * 0.2
				let next = Math.min(1, Math.max(0, total > 0 ? read / total : 1))
				if (Math.abs(next - progress) > 0.002) {
					progress = next
					if (progress >= 0.995) done = true
					handle.update()
				}
			}
			let schedule = () => {
				if (!frame) frame = requestAnimationFrame(measure)
			}
			window.addEventListener('scroll', schedule, { passive: true, signal: handle.signal })
			window.addEventListener('resize', schedule, { signal: handle.signal })
			handle.signal.addEventListener('abort', () => cancelAnimationFrame(frame))
			measure()
		})

		return () => (
			<div mix={barStyle}>
				<div
					className="track"
					role="progressbar"
					aria-label="Reading progress"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(progress * 100)}
				>
					<svg className="line" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
						<path
							d="M0 6 C 60 3, 120 9, 180 6 S 300 3, 360 6 S 480 9, 540 6 S 660 3, 720 6 S 840 9, 900 6 S 980 4, 1000 6"
							pathLength={1}
							style={{ strokeDashoffset: 1 - progress }}
						/>
					</svg>
					<svg
						className="pencil"
						viewBox="0 0 40 20"
						aria-hidden="true"
						style={{ left: `${progress * 100}%` }}
					>
						<path
							d="M2 10 L 10 5 H 36 V 15 H 10 Z"
							fill="var(--paper)"
							stroke="var(--ink)"
							strokeWidth={1.5}
							strokeLinejoin="round"
						/>
						<path
							d="M2 10 L 10 5 V 15 Z"
							fill="var(--paper)"
							stroke="var(--ink)"
							strokeWidth={1.5}
							strokeLinejoin="round"
						/>
						<path d="M2 10 L 5 8.2 V 11.8 Z" fill="var(--ink)" />
						<path
							d="M31 5 H 36 V 15 H 31 Z"
							fill="var(--ink)"
							stroke="var(--ink)"
							strokeWidth={1.5}
						/>
					</svg>
				</div>
				<p className={done ? 'stamp is-in' : 'stamp'} aria-live="polite">
					{done ? 'DONE ✓' : ''}
				</p>
			</div>
		)
	},
)

const barStyle = css({
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	zIndex: 80,
	pointerEvents: 'none',
	'& .track': {
		position: 'relative',
		height: '16px',
		marginInline: '12px',
	},
	'& .line': {
		position: 'absolute',
		inset: '2px 0 auto',
		width: '100%',
		height: '12px',
		overflow: 'visible',
	},
	'& .line path': {
		fill: 'none',
		stroke: 'var(--ink)',
		strokeWidth: 2,
		strokeLinecap: 'round',
		strokeDasharray: 1,
		vectorEffect: 'non-scaling-stroke',
	},
	'& .pencil': {
		position: 'absolute',
		top: '-2px',
		width: '40px',
		height: '20px',
		transform: 'translateX(-2px) scaleX(-1) rotate(-12deg)',
		transformOrigin: 'left center',
		filter: 'drop-shadow(1px 2px 1px rgb(0 0 0 / 0.2))',
	},
	'& .stamp': {
		position: 'fixed',
		right: '24px',
		bottom: '24px',
		padding: '2px 14px',
		fontFamily: 'var(--font-hand)',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: 'var(--ink)',
		border: '3px double var(--ink)',
		opacity: 0,
		transform: 'rotate(-12deg) scale(2)',
	},
	'& .stamp.is-in': {
		animation: 'stamp 380ms cubic-bezier(.3,1.6,.5,1) forwards',
	},
	'@keyframes stamp': {
		to: { opacity: 0.9, transform: 'rotate(-12deg) scale(1)' },
	},
})
