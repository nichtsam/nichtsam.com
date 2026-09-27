import { clientEntry, css, on, ref } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { CircleScribble, Underline } from './doodles.tsx'
import { prefersReducedMotion } from './theme.ts'

type Tool = 'blue' | 'red' | 'highlighter'

interface Stroke {
	points: Array<[number, number]>
	tool: Tool
	endedAt?: number
}

const TOOLS: Array<{ id: Tool; label: string }> = [
	{ id: 'blue', label: 'Blue pen' },
	{ id: 'red', label: 'Red pen' },
	{ id: 'highlighter', label: 'Highlighter' },
]

const LINES = [
	"Hi there, I'm Sam.",
	'You can call me Sam.',
	'Oh, and this is my website by the way.',
	"Go on, draw on the page. I won't tell anyone.",
	'The sticky notes down there? You can drag them around.',
	'Poke me again and I will… say something else.',
	"Okay, that's genuinely all I've got.",
]

const HOLD_MS = 4500
const FADE_MS = 1500

/**
 * The home page hero: a sketchbook page you can scribble on, with a stick
 * figure Sam whose eyes follow your pointer.
 */
export const Sketchpad = clientEntry(import.meta.url, function Sketchpad(handle: Handle) {
	let tool: Tool = 'blue'
	let armed = true
	let strokes: Stroke[] = []
	let current: Stroke | null = null
	let canvas: HTMLCanvasElement | undefined
	let ctx: CanvasRenderingContext2D | null = null
	let frame = 0
	let line = 0
	let hop = 0
	let pupil = { x: 0, y: 0 }
	let eyes: SVGGElement | undefined
	let hasDrawn = false

	handle.queueTask(() => {
		if (window.matchMedia('(pointer: coarse)').matches) armed = false
		window.addEventListener('pointermove', trackEyes, { passive: true, signal: handle.signal })
		handle.signal.addEventListener('abort', () => cancelAnimationFrame(frame))
		handle.update()
	})

	function trackEyes(event: PointerEvent) {
		if (!eyes) return
		let rect = eyes.getBoundingClientRect()
		let dx = event.clientX - (rect.left + rect.width / 2)
		let dy = event.clientY - (rect.top + rect.height / 2)
		let length = Math.hypot(dx, dy) || 1
		let reach = Math.min(1, length / 180) * 2.6
		let next = { x: (dx / length) * reach, y: (dy / length) * reach }
		if (Math.abs(next.x - pupil.x) + Math.abs(next.y - pupil.y) > 0.15) {
			pupil = next
			handle.update()
		}
	}

	function setupCanvas(node: HTMLCanvasElement, signal: AbortSignal) {
		canvas = node
		ctx = node.getContext('2d')
		let resize = () => {
			let ratio = window.devicePixelRatio || 1
			let rect = node.getBoundingClientRect()
			node.width = Math.round(rect.width * ratio)
			node.height = Math.round(rect.height * ratio)
			ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
			draw()
		}
		let observer = new ResizeObserver(resize)
		observer.observe(node)
		signal.addEventListener('abort', () => observer.disconnect())
	}

	function color(t: Tool) {
		let styles = getComputedStyle(document.documentElement)
		let token = t === 'blue' ? '--pen-blue' : t === 'red' ? '--pen-red' : '--hl-yellow'
		return styles.getPropertyValue(token).trim() || '#2b59c3'
	}

	function draw() {
		frame = 0
		if (!ctx || !canvas) return
		let now = performance.now()
		let rect = canvas.getBoundingClientRect()
		ctx.clearRect(0, 0, rect.width, rect.height)
		strokes = strokes.filter((s) => !s.endedAt || now - s.endedAt < HOLD_MS + FADE_MS)
		for (let s of strokes) {
			let age = s.endedAt ? now - s.endedAt : 0
			let fade = age > HOLD_MS ? 1 - (age - HOLD_MS) / FADE_MS : 1
			let highlighter = s.tool === 'highlighter'
			ctx.save()
			ctx.globalAlpha = Math.max(0, fade) * (highlighter ? 0.55 : 0.95)
			ctx.globalCompositeOperation = highlighter ? 'multiply' : 'source-over'
			if (document.documentElement.dataset.theme === 'dark' && highlighter) {
				ctx.globalCompositeOperation = 'screen'
			}
			ctx.strokeStyle = color(s.tool)
			ctx.lineWidth = highlighter ? 22 : 3.2
			ctx.lineCap = highlighter ? 'butt' : 'round'
			ctx.lineJoin = 'round'
			ctx.beginPath()
			let [first, ...rest] = s.points
			if (first) ctx.moveTo(first[0], first[1])
			for (let i = 0; i < rest.length; i++) {
				let [x, y] = rest[i]!
				let next = rest[i + 1]
				if (next) ctx.quadraticCurveTo(x, y, (x + next[0]) / 2, (y + next[1]) / 2)
				else ctx.lineTo(x, y)
			}
			ctx.stroke()
			ctx.restore()
		}
		if (strokes.length) frame = requestAnimationFrame(draw)
	}

	function schedule() {
		if (!frame) frame = requestAnimationFrame(draw)
	}

	function point(event: PointerEvent): [number, number] {
		let rect = canvas!.getBoundingClientRect()
		return [event.clientX - rect.left, event.clientY - rect.top]
	}

	function onDown(event: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		if (event.button !== 0) return
		if (event.pointerType !== 'mouse' && !armed) return
		event.currentTarget.setPointerCapture(event.pointerId)
		current = { points: [point(event)], tool }
		strokes.push(current)
		if (!hasDrawn) {
			hasDrawn = true
			handle.update()
		}
		schedule()
	}

	function onMove(event: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		if (!current) return
		current.points.push(point(event))
		schedule()
	}

	function onUp() {
		if (!current) return
		current.endedAt = performance.now()
		current = null
		schedule()
	}

	function poke() {
		line = (line + 1) % LINES.length
		hop++
		handle.update()
	}

	return () => {
		let touchAction = armed ? 'none' : 'pan-y'
		return (
			<section mix={padStyle} aria-labelledby="hero-title">
				<canvas
					className="ink"
					aria-hidden="true"
					data-no-doodle
					style={{ touchAction }}
					mix={[
						ref(setupCanvas),
						on('pointerdown', onDown),
						on('pointermove', onMove),
						on('pointerup', onUp),
						on('pointercancel', onUp),
					]}
				/>

				<div className="words">
					<p className="eyebrow">hello, hi, welcome ✎</p>
					<h1 id="hero-title">
						<span className="first">
							Samuel
							<CircleScribble className="ring boil" />
						</span>{' '}
						<span className="last">Jensen</span>
					</h1>
					<p className="lede">
						This is my website: a slightly messy notebook with some things I made and a few things I
						wrote.
					</p>
				</div>

				<div className="sam-wrap">
					<p className="bubble" aria-live="polite">
						{LINES[line]}
					</p>
					<button
						type="button"
						className="sam"
						aria-label="Poke Sam"
						data-no-doodle
						mix={on('click', poke)}
					>
						<StickSam
							pupilX={pupil.x}
							pupilY={pupil.y}
							hop={hop}
							setEyes={(node) => {
								eyes = node
							}}
						/>
					</button>
				</div>

				<div className="toolbar" data-no-doodle>
					<span className="hint">{hasDrawn ? 'nice one →' : 'psst, you can draw here →'}</span>
					{TOOLS.map((item) => (
						<button
							key={item.id}
							type="button"
							className={`tool tool-${item.id}`}
							aria-label={item.label}
							aria-pressed={armed && tool === item.id}
							mix={on('click', () => {
								tool = item.id
								armed = true
								handle.update()
							})}
						/>
					))}
					<button
						type="button"
						className="clear"
						mix={on('click', () => {
							strokes = []
							current = null
							schedule()
						})}
					>
						erase
					</button>
				</div>
				<Underline className="scribble-bottom boil" />
			</section>
		)
	}
})

function StickSam(
	handle: Handle<{
		pupilX: number
		pupilY: number
		hop: number
		setEyes: (node: SVGGElement) => void
	}>,
) {
	let lastHop = 0
	let hopping = false
	return () => {
		let { pupilX, pupilY, hop, setEyes } = handle.props
		if (hop !== lastHop) {
			lastHop = hop
			hopping = !prefersReducedMotion()
			handle.queueTask(() => {
				window.setTimeout(() => {
					hopping = false
					handle.update()
				}, 350)
			})
		}
		let ink = {
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 3,
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
		} as const
		return (
			<svg viewBox="0 0 140 190" className={hopping ? 'figure hop' : 'figure'} aria-hidden="true">
				<g className="boil">
					{/* hair */}
					<path
						{...ink}
						d="M44 42 C 42 20, 60 12, 72 14 C 88 14, 98 24, 96 40 M48 30 L 54 20 L 58 30 L 64 17 L 68 29 L 74 16 L 78 29 L 84 19 L 86 31 L 92 24"
					/>
					{/* head */}
					<path
						{...ink}
						d="M70 22 C 88 21, 98 34, 97 50 C 96 66, 84 76, 69 75 C 53 74, 43 62, 44 47 C 45 32, 56 22, 72 23"
					/>
					{/* smile + cheeks */}
					<path {...ink} d="M60 60 C 64 66, 76 66, 80 59" />
					<path
						d="M52 58 h 5 M83 58 h 5"
						stroke="var(--pen-red)"
						strokeWidth={2.5}
						strokeLinecap="round"
						opacity={0.6}
					/>
					{/* neck */}
					<path {...ink} d="M70 75 V 84" />
					{/* t-shirt */}
					<path
						d="M50 86 C 58 83, 82 83, 90 86 L 96 100 L 88 103 L 86 132 C 76 134, 64 134, 54 132 L 52 103 L 44 100 Z"
						fill="var(--pen-red)"
						fillOpacity={0.28}
						stroke="var(--pen-red)"
						strokeWidth={2.5}
						strokeLinejoin="round"
					/>
					<path
						d="M58 96 L 66 118 M68 92 L 76 124 M78 96 L 82 110"
						stroke="var(--pen-red)"
						strokeWidth={1.5}
						opacity={0.5}
					/>
					{/* left arm */}
					<path {...ink} d="M48 98 C 40 110, 36 120, 34 132" />
					{/* legs */}
					<path
						{...ink}
						d="M60 133 C 58 148, 55 162, 52 176 L 42 178 M80 133 C 82 148, 85 162, 88 176 L 98 178"
					/>
				</g>
				{/* waving arm */}
				<g className="wave boil">
					<path {...ink} d="M92 98 C 102 90, 110 80, 116 66" />
					<path {...ink} d="M116 66 L 112 56 M116 66 L 119 55 M116 66 L 125 58" />
				</g>
				{/* eyes */}
				<g mix={ref((node) => setEyes(node as unknown as SVGGElement))}>
					<circle
						cx={60}
						cy={46}
						r={5.5}
						fill="var(--card)"
						stroke="currentColor"
						strokeWidth={2}
					/>
					<circle
						cx={80}
						cy={46}
						r={5.5}
						fill="var(--card)"
						stroke="currentColor"
						strokeWidth={2}
					/>
					<circle cx={60 + pupilX} cy={46 + pupilY} r={2.6} fill="currentColor" />
					<circle cx={80 + pupilX} cy={46 + pupilY} r={2.6} fill="currentColor" />
				</g>
			</svg>
		)
	}
}

const padStyle = css({
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	alignItems: 'center',
	gap: '12px 32px',
	padding: 'clamp(28px, 5vw, 56px) clamp(20px, 5vw, 56px) 88px',
	marginBottom: '28px',
	'& .ink': {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		zIndex: 2,
	},
	'& .words': {
		position: 'relative',
		zIndex: 1,
		display: 'grid',
		gap: '14px',
		pointerEvents: 'none',
	},
	'& .eyebrow': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.6rem',
		color: 'var(--pen-blue)',
		transform: 'rotate(-3deg)',
		transformOrigin: 'left',
	},
	'& h1': {
		fontFamily: 'var(--font-hand)',
		fontWeight: 700,
		fontSize: 'clamp(3.6rem, 12vw, 7.5rem)',
		lineHeight: 0.85,
		letterSpacing: '-0.01em',
	},
	'& .first': {
		position: 'relative',
		display: 'inline-block',
	},
	'& .first .ring': {
		position: 'absolute',
		inset: '-8% -12% -10% -10%',
		width: '122%',
		height: '118%',
		color: 'var(--pen-red)',
		pointerEvents: 'none',
	},
	'& .first .ring path': {
		strokeDasharray: 1,
		strokeDashoffset: 1,
		animation: 'hero-draw 900ms 300ms ease-out forwards',
	},
	'& .last': {
		color: 'var(--pen-blue)',
	},
	'& .lede': {
		maxWidth: '32rem',
		fontSize: '1.1rem',
		color: 'var(--ink-soft)',
	},
	'& .sam-wrap': {
		position: 'relative',
		zIndex: 3,
		display: 'grid',
		justifyItems: 'center',
		gap: '8px',
		width: 'clamp(150px, 22vw, 210px)',
	},
	'& .bubble': {
		position: 'relative',
		minHeight: '4.2em',
		display: 'grid',
		placeItems: 'center',
		width: 'clamp(180px, 24vw, 240px)',
		padding: '10px 16px',
		fontFamily: 'var(--font-note)',
		fontSize: '1.15rem',
		lineHeight: 1.3,
		textAlign: 'center',
		background: 'var(--card)',
		border: '2px solid var(--ink)',
		borderRadius: 'var(--sketch-radius)',
	},
	'& .bubble::after': {
		content: '""',
		position: 'absolute',
		bottom: '-14px',
		left: '46%',
		width: '18px',
		height: '18px',
		background: 'var(--card)',
		borderRight: '2px solid var(--ink)',
		borderBottom: '2px solid var(--ink)',
		transform: 'rotate(40deg) skew(10deg, 10deg)',
	},
	'& .sam': {
		padding: 0,
		border: 0,
		background: 'transparent',
		color: 'var(--ink)',
		width: '100%',
	},
	'& .figure': {
		width: '100%',
		height: 'auto',
		overflow: 'visible',
	},
	'& .figure.hop': {
		animation: 'hop 350ms ease-out',
	},
	'& .wave': {
		transformOrigin: '92px 98px',
		animation: 'wave 1.6s ease-in-out infinite',
	},
	'& .sam:hover .wave': {
		animationDuration: '0.5s',
	},
	'& .toolbar': {
		position: 'absolute',
		zIndex: 3,
		right: 'clamp(20px, 5vw, 56px)',
		bottom: '22px',
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	'& .hint': {
		fontFamily: 'var(--font-hand)',
		fontSize: '1.35rem',
		color: 'var(--ink-soft)',
		transform: 'rotate(-2deg)',
	},
	'& .tool': {
		width: '30px',
		height: '30px',
		padding: 0,
		border: '2px solid var(--ink)',
		borderRadius: '50% 45% 55% 48% / 48% 55% 45% 50%',
		transition: 'transform 150ms ease',
	},
	'& .tool:hover': { transform: 'translateY(-3px) rotate(-8deg)' },
	'& .tool[aria-pressed="true"]': {
		transform: 'translateY(-4px) scale(1.12)',
		boxShadow: '0 0 0 3px var(--paper), 0 0 0 5px var(--ink)',
	},
	'& .tool-blue': { background: 'var(--pen-blue)' },
	'& .tool-red': { background: 'var(--pen-red)' },
	'& .tool-highlighter': {
		background: '#fff27a',
		borderRadius: '6px 10px 4px 12px',
	},
	'& .clear': {
		padding: '0 12px',
		fontFamily: 'var(--font-hand)',
		fontSize: '1.35rem',
		fontWeight: 700,
		background: 'var(--card)',
		border: '2px solid var(--ink)',
		borderRadius: 'var(--sketch-radius-2)',
	},
	'& .clear:hover': { background: 'var(--hl-pink)', color: 'var(--hl-ink)' },
	'& .scribble-bottom': {
		position: 'absolute',
		left: '4%',
		right: '4%',
		bottom: 0,
		width: '92%',
		height: '14px',
		color: 'var(--ink-soft)',
		opacity: 0.5,
		pointerEvents: 'none',
	},
	'@media (max-width: 700px)': {
		gridTemplateColumns: '1fr',
		paddingBottom: '96px',
		'& .sam-wrap': {
			justifySelf: 'end',
			width: 'min(220px, 100%)',
			marginTop: '-12px',
		},
		'& .sam': { width: '150px' },
		'& .bubble': { width: '100%' },
		'& .toolbar': {
			left: '20px',
			right: '20px',
			flexWrap: 'wrap',
		},
		'& .hint': { width: '100%' },
	},
	'@keyframes hero-draw': {
		to: { strokeDashoffset: 0 },
	},
	'@keyframes wave': {
		'0%, 100%': { transform: 'rotate(0deg)' },
		'50%': { transform: 'rotate(-18deg)' },
	},
	'@keyframes hop': {
		'40%': { transform: 'translateY(-14px) rotate(-3deg)' },
	},
})
