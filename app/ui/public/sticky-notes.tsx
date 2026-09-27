import { clientEntry, css, on } from 'remix/ui'
import type { Handle } from 'remix/ui'

export type StickyNotesProps = {
	articlesHref: string
	github: string
	linkedin: string
}

interface Note {
	id: string
	color: string
	/** Position as a percentage of the board (desktop, then narrow screens). */
	x: number
	y: number
	mx: number
	my: number
	tilt: number
}

const INITIAL: Note[] = [
	{ id: 'articles', color: 'var(--note-yellow)', x: 3, y: 10, mx: 2, my: 3, tilt: -4 },
	{ id: 'github', color: 'var(--note-pink)', x: 27, y: 38, mx: 4, my: 44, tilt: 3 },
	{ id: 'linkedin', color: 'var(--note-blue)', x: 51, y: 6, mx: 54, my: 8, tilt: -2 },
	{ id: 'todo', color: 'var(--note-green)', x: 74, y: 30, mx: 52, my: 40, tilt: 5 },
]

const TODOS = [
	{ label: 'rebuild website (again)', done: true },
	{ label: 'try Remix 3', done: true },
	{ label: 'write more articles', done: false },
	{ label: 'water the plant', done: false },
]

/** A cork-less "desk" of sticky notes you can drag around. */
export const StickyNotes = clientEntry(
	import.meta.url,
	function StickyNotes(handle: Handle<StickyNotesProps>) {
		let notes = INITIAL.map((note) => ({ ...note }))
		let order = notes.map((note) => note.id)
		let todos = TODOS.map((todo) => ({ ...todo }))
		let board: HTMLElement | undefined
		let drag: {
			id: string
			startX: number
			startY: number
			originX: number
			originY: number
			narrow: boolean
			moved: boolean
		} | null = null
		let justDragged = false

		function bringToFront(id: string) {
			order = [...order.filter((entry) => entry !== id), id]
		}

		function onDown(note: Note) {
			return (event: PointerEvent & { currentTarget: HTMLElement }) => {
				if (event.button !== 0) return
				if ((event.target as HTMLElement).closest('input, label')) return
				board = event.currentTarget.parentElement ?? undefined
				event.currentTarget.setPointerCapture(event.pointerId)
				let narrow = window.matchMedia('(max-width: 560px)').matches
				drag = {
					id: note.id,
					startX: event.clientX,
					startY: event.clientY,
					originX: narrow ? note.mx : note.x,
					originY: narrow ? note.my : note.y,
					narrow,
					moved: false,
				}
				bringToFront(note.id)
				handle.update()
			}
		}

		function onMove(event: PointerEvent & { currentTarget: HTMLElement }) {
			if (!drag || !board) return
			let dx = event.clientX - drag.startX
			let dy = event.clientY - drag.startY
			if (!drag.moved && Math.hypot(dx, dy) < 5) return
			drag.moved = true
			let rect = board.getBoundingClientRect()
			let note = notes.find((entry) => entry.id === drag!.id)!
			let maxX = 100 - (event.currentTarget.offsetWidth / rect.width) * 100
			let maxY = 100 - (event.currentTarget.offsetHeight / rect.height) * 100
			let x = Math.min(maxX, Math.max(0, drag.originX + (dx / rect.width) * 100))
			let y = Math.min(maxY, Math.max(0, drag.originY + (dy / rect.height) * 100))
			if (drag.narrow) {
				note.mx = x
				note.my = y
			} else {
				note.x = x
				note.y = y
			}
			handle.update()
		}

		function onUp(_event: PointerEvent & { currentTarget: HTMLElement }) {
			if (!drag) return
			justDragged = drag.moved
			drag = null
			handle.update()
			window.setTimeout(() => (justDragged = false), 0)
		}

		function preventClickAfterDrag(event: MouseEvent & { currentTarget: HTMLElement }) {
			if (justDragged) event.preventDefault()
		}

		return () => {
			let { articlesHref, github, linkedin } = handle.props
			return (
				<div mix={boardStyle} data-no-doodle>
					{notes.map((note) => {
						let dragging = drag?.id === note.id && drag.moved
						let style = {
							'--x': `${note.x}%`,
							'--y': `${note.y}%`,
							'--mx': `${note.mx}%`,
							'--my': `${note.my}%`,
							background: note.color,
							zIndex: order.indexOf(note.id) + 1,
							'--tilt': `${note.tilt}deg`,
						}
						let behaviour = [
							on('pointerdown', onDown(note)),
							on('pointermove', onMove),
							on('pointerup', onUp),
							on('pointercancel', onUp),
							on('click', preventClickAfterDrag),
						]
						let className = dragging ? 'note is-dragging' : 'note'
						if (note.id === 'todo') {
							return (
								<div key={note.id} className={className} style={style} mix={behaviour}>
									<p className="title">todo</p>
									<ul className="todos">
										{todos.map((todo, index) => (
											<li key={todo.label}>
												<label>
													<input
														type="checkbox"
														checked={todo.done}
														mix={on('change', () => {
															todos[index]!.done = !todos[index]!.done
															handle.update()
														})}
													/>
													<span>{todo.label}</span>
												</label>
											</li>
										))}
									</ul>
								</div>
							)
						}
						let content = {
							articles: { href: articlesHref, title: 'articles', text: 'things I wrote down →' },
							github: { href: github, title: 'GitHub', text: 'code, experiments & chaos ↗' },
							linkedin: { href: linkedin, title: 'LinkedIn', text: 'the serious version of me ↗' },
						}[note.id]!
						let external = note.id !== 'articles'
						return (
							<a
								key={note.id}
								href={content.href}
								target={external ? '_blank' : undefined}
								rel={external ? 'noreferrer' : undefined}
								className={className}
								style={style}
								draggable={false}
								mix={behaviour}
							>
								<span className="title">{content.title}</span>
								<span className="text">{content.text}</span>
							</a>
						)
					})}
					<p className="hint" aria-hidden="true">
						(you can drag these around)
					</p>
				</div>
			)
		}
	},
)

const boardStyle = css({
	position: 'relative',
	height: 'clamp(380px, 46vw, 440px)',
	userSelect: 'none',
	'& .note': {
		position: 'absolute',
		left: 'min(var(--x), calc(100% - clamp(150px, 22vw, 210px)))',
		top: 'var(--y)',
		display: 'grid',
		alignContent: 'start',
		gap: '6px',
		width: 'clamp(150px, 22vw, 210px)',
		minHeight: 'clamp(140px, 18vw, 180px)',
		padding: '26px 16px 16px',
		color: 'var(--note-ink)',
		textDecoration: 'none',
		boxShadow: '2px 8px 14px -6px var(--shadow)',
		transform: 'rotate(var(--tilt))',
		transition: 'transform 180ms ease, box-shadow 180ms ease',
		touchAction: 'none',
		borderRadius: '2px 2px 18px 2px / 2px 2px 8px 2px',
	},
	'& .note::before': {
		content: '""',
		position: 'absolute',
		top: '-10px',
		left: '50%',
		width: '70px',
		height: '22px',
		translate: '-50% 0',
		rotate: '4deg',
		background: 'var(--tape)',
		boxShadow: '0 1px 2px var(--shadow)',
	},
	'& .note:hover, & .note:focus-visible': {
		transform: 'rotate(0deg) scale(1.04)',
		boxShadow: '4px 14px 20px -8px var(--shadow)',
	},
	'& .note.is-dragging': {
		transform: 'rotate(calc(var(--tilt) * -1.5)) scale(1.08)',
		boxShadow: '8px 22px 26px -10px var(--shadow)',
		transition: 'none',
	},
	'& .title': {
		fontFamily: 'var(--font-hand)',
		fontSize: '2rem',
		fontWeight: 700,
		lineHeight: 1,
	},
	'& .text': {
		fontFamily: 'var(--font-note)',
		fontSize: '1.15rem',
		lineHeight: 1.3,
	},
	'& .todos': {
		listStyle: 'none',
		padding: 0,
		fontFamily: 'var(--font-note)',
		fontSize: '1.05rem',
		lineHeight: 1.35,
	},
	'& .todos label': {
		display: 'flex',
		gap: '8px',
		alignItems: 'baseline',
	},
	'& .todos input': {
		accentColor: 'var(--pen-green)',
		width: '15px',
		height: '15px',
		flex: 'none',
	},
	'& .todos input:checked + span': {
		textDecoration: 'line-through',
		textDecorationColor: 'var(--pen-red)',
		textDecorationThickness: '2px',
		opacity: 0.7,
	},
	'& .hint': {
		position: 'absolute',
		right: '8px',
		bottom: '0',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.3rem',
		color: 'var(--ink-soft)',
		transform: 'rotate(-2deg)',
	},
	'@media (max-width: 560px)': {
		height: '540px',
		'& .note': {
			left: 'min(var(--mx), calc(100% - 150px))',
			top: 'var(--my)',
		},
	},
})
