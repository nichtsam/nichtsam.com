import { clientEntry, css, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

/** The classic arcade "CONTINUE? 9… 8… 7…" prompt for the 404 page. */
export const ContinueCountdown = clientEntry(
	import.meta.url,
	function ContinueCountdown(handle: Handle<{ homeHref: string }>) {
		let count = 9
		let declined = false
		let timer: number | undefined

		handle.queueTask(() => {
			timer = window.setInterval(() => {
				if (count <= 0) return window.clearInterval(timer)
				count--
				handle.update()
			}, 1000)
			handle.signal.addEventListener('abort', () => window.clearInterval(timer))
		})

		return () => {
			let over = declined || count === 0
			return (
				<div mix={continueStyle}>
					{over ? (
						<p className="over">Thanks for playing!</p>
					) : (
						<p className="prompt">
							Continue? <span className="count">{count}</span>
						</p>
					)}
					<div className="actions">
						<a href={handle.props.homeHref} className="yes">
							{over ? 'Insert coin (go home)' : 'Yes'}
						</a>
						{!over && (
							<button
								type="button"
								mix={on('click', () => {
									declined = true
									window.clearInterval(timer)
									handle.update()
								})}
							>
								No
							</button>
						)}
					</div>
				</div>
			)
		}
	},
)

const continueStyle = css({
	display: 'grid',
	justifyItems: 'center',
	gap: '20px',
	'& .prompt, & .over': {
		fontFamily: 'var(--font-display)',
		fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
		fontWeight: 700,
	},
	'& .count': {
		display: 'inline-block',
		minWidth: '1.2em',
		color: 'var(--accent)',
		animation: 'count-pulse 1s steps(2) infinite',
	},
	'& .actions': {
		display: 'flex',
		gap: '16px',
	},
	'& a, & button': {
		padding: '8px 22px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.9rem',
		textDecoration: 'none',
		color: 'var(--ink)',
		background: 'var(--surface)',
		border: 'var(--px) solid var(--line)',
		boxShadow: '0 var(--px) 0 var(--shadow)',
	},
	'& .yes': {
		background: 'var(--accent)',
		color: 'var(--accent-ink)',
	},
	'& a:hover, & button:hover': {
		background: 'var(--gold)',
		color: '#22203a',
	},
	'@keyframes count-pulse': {
		'50%': { transform: 'scale(1.25)' },
	},
})
