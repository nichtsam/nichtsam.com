import { clientEntry, css } from 'remix/ui'
import type { Handle } from 'remix/ui'

/**
 * An XP bar pinned to the top of the viewport that fills as the article is read,
 * with a little "quest complete" flourish at the end.
 */
export const ReadingProgress = clientEntry(
	import.meta.url,
	function ReadingProgress(handle: Handle<{ targetId: string }>) {
		let progress = 0
		let cleared = false
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
				// Snap to 5% "pixels" so the bar moves in chunky steps.
				next = Math.round(next * 20) / 20
				if (next !== progress) {
					progress = next
					if (progress >= 1) cleared = true
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
			<div mix={barStyle} data-xp-bar className={cleared ? 'is-cleared' : undefined}>
				<span className="label" aria-hidden="true">
					XP
				</span>
				<div
					className="track"
					role="progressbar"
					aria-label="Reading progress"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(progress * 100)}
				>
					<div className="fill" style={{ width: `${progress * 100}%` }} />
				</div>
				<span className="done" aria-live="polite">
					{cleared ? 'Quest complete! +100 XP' : ''}
				</span>
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
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	padding: '6px 12px',
	background: 'var(--bg)',
	borderBottom: 'var(--px) solid var(--line)',
	fontFamily: 'var(--font-label)',
	fontSize: '0.7rem',
	'& .label': {
		padding: '0 4px',
		background: 'var(--gold)',
		color: '#22203a',
	},
	'& .track': {
		flex: 1,
		height: '10px',
		background: 'var(--surface-2)',
		boxShadow: '0 0 0 2px var(--line)',
	},
	'& .fill': {
		height: '100%',
		background:
			'repeating-linear-gradient(90deg, var(--green) 0 8px, color-mix(in srgb, var(--green), black 20%) 8px 10px)',
		transition: 'width 120ms steps(3)',
	},
	'& .done': {
		minWidth: 0,
		whiteSpace: 'nowrap',
		color: 'var(--accent)',
	},
	'&.is-cleared .done': {
		animation: 'cleared 0.6s steps(2) 3',
	},
	'@keyframes cleared': {
		'50%': { opacity: 0 },
	},
})
