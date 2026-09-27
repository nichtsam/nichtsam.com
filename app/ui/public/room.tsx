import { clientEntry, css, on, ref } from 'remix/ui'
import type { Handle } from 'remix/ui'

import { playJingle } from './chiptune.ts'
import { PixelArt, type Sprite } from './pixel.tsx'
import * as S from './sprites.ts'
import { getTheme, prefersReducedMotion, THEME_EVENT, toggleTheme, type Theme } from './theme.ts'

// ─── World ───────────────────────────────────────────────────────────────

const TILE = 16
const COLS = 16
const ROWS = 9
const WALL_ROWS = 4
const W = COLS * TILE
const H = ROWS * TILE
const STEP_MS = 130

type Dir = 'up' | 'down' | 'left' | 'right'
type Tile = readonly [number, number]
type ObjectId = 'door' | 'window' | 'poster' | 'bookshelf' | 'desk' | 'plant' | 'cat' | 'boombox'

interface RoomObject {
	id: ObjectId
	label: string
	/** Position of the sprite in room pixels. */
	x: number
	y: number
	/** Tiles that trigger this object when Sam faces them. */
	tiles: Tile[]
	/** Floor tiles the object occupies (not walkable). */
	blocks?: Tile[]
	/** Where Sam walks to when the object is clicked, and which way he faces there. */
	spot: Tile
	face: Dir
}

const OBJECTS: RoomObject[] = [
	{
		id: 'door',
		label: 'Door',
		x: 16,
		y: 16,
		tiles: [
			[1, 3],
			[2, 3],
		],
		spot: [1, 4],
		face: 'up',
	},
	{
		id: 'window',
		label: 'Window',
		x: 56,
		y: 12,
		tiles: [
			[3, 3],
			[4, 3],
			[5, 3],
			[6, 3],
		],
		spot: [4, 4],
		face: 'up',
	},
	{
		id: 'poster',
		label: 'Poster',
		x: 116,
		y: 18,
		tiles: [
			[7, 3],
			[8, 3],
		],
		spot: [7, 4],
		face: 'up',
	},
	{
		id: 'bookshelf',
		label: 'Bookshelf',
		x: 160,
		y: 24,
		tiles: [
			[10, 4],
			[11, 4],
			[10, 3],
			[11, 3],
		],
		blocks: [
			[10, 4],
			[11, 4],
		],
		spot: [10, 5],
		face: 'up',
	},
	{
		id: 'desk',
		label: 'Computer',
		x: 192,
		y: 40,
		tiles: [
			[12, 4],
			[13, 4],
			[14, 4],
		],
		blocks: [
			[12, 4],
			[13, 4],
			[14, 4],
		],
		spot: [13, 5],
		face: 'up',
	},
	{
		id: 'plant',
		label: 'Plant',
		x: 240,
		y: 42,
		tiles: [[15, 4]],
		blocks: [[15, 4]],
		spot: [15, 5],
		face: 'up',
	},
	{
		id: 'cat',
		label: 'Cat',
		x: 48,
		y: 112,
		tiles: [[3, 7]],
		blocks: [[3, 7]],
		spot: [4, 7],
		face: 'left',
	},
	{
		id: 'boombox',
		label: 'Boombox',
		x: 208,
		y: 130,
		tiles: [[13, 8]],
		blocks: [[13, 8]],
		spot: [13, 7],
		face: 'down',
	},
]

const START: Tile = [8, 6]

const blocked = new Set<string>()
for (let obj of OBJECTS) for (let [x, y] of obj.blocks ?? []) blocked.add(`${x},${y}`)

function walkable([x, y]: Tile) {
	return x >= 0 && x < COLS && y >= WALL_ROWS && y < ROWS && !blocked.has(`${x},${y}`)
}

const DELTA: Record<Dir, Tile> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

function findPath(from: Tile, to: Tile): Tile[] | null {
	if (!walkable(to)) return null
	let key = (t: Tile) => `${t[0]},${t[1]}`
	let prev = new Map<string, Tile | null>([[key(from), null]])
	let queue: Tile[] = [from]
	while (queue.length) {
		let current = queue.shift()!
		if (current[0] === to[0] && current[1] === to[1]) {
			let path: Tile[] = []
			let node: Tile | null = current
			while (node && key(node) !== key(from)) {
				path.unshift(node)
				node = prev.get(key(node)) ?? null
			}
			return path
		}
		for (let [dx, dy] of Object.values(DELTA)) {
			let next: Tile = [current[0] + dx, current[1] + dy]
			if (walkable(next) && !prev.has(key(next))) {
				prev.set(key(next), current)
				queue.push(next)
			}
		}
	}
	return null
}

function objectAt(tile: Tile) {
	return OBJECTS.find((obj) => obj.tiles.some(([x, y]) => x === tile[0] && y === tile[1]))
}

const pct = (value: number, total: number) => `${(value / total) * 100}%`

// ─── Dialog content ──────────────────────────────────────────────────────

interface Choice {
	label: string
	href?: string
	external?: boolean
	run?: () => void
}

interface Dialog {
	speaker: string
	text: string
	choices: Choice[]
}

export type RoomProps = {
	articlesHref: string
	latest: Array<{ title: string; href: string }>
	github: string
	linkedin: string
}

const PLANT_LINES = [
	"It's a plant. It's doing its best. You give it some water.",
	'The plant looks a little taller. Or is that just you?',
	"It's definitely growing. You're a natural.",
	"It bloomed! Honestly, that's more than I've achieved today.",
]

// ─── Component ───────────────────────────────────────────────────────────

export const Room = clientEntry(import.meta.url, function Room(handle: Handle<RoomProps>) {
	let pos: Tile = START
	let facing: Dir = 'down'
	let stepping = false
	let walkToken = 0
	let dialog: Dialog | null = null
	let revealed = 0
	let theme: Theme = 'light'
	let plantStage = 0
	let musicUntil = 0
	let hearts: number[] = []
	let heartId = 0
	let hydrated = false
	let root: HTMLElement | undefined
	let panel: HTMLElement | undefined
	let typeTimer: number | undefined

	handle.queueTask(() => {
		hydrated = true
		theme = getTheme()
		try {
			plantStage = Math.min(3, Number(localStorage.getItem('plant-stage') ?? 0) || 0)
		} catch {}
		document.addEventListener(
			THEME_EVENT,
			() => {
				theme = getTheme()
				handle.update()
			},
			{ signal: handle.signal },
		)
		window.addEventListener('keydown', onKeyDown, { signal: handle.signal })
		handle.signal.addEventListener('abort', () => window.clearTimeout(typeTimer))
		handle.update()
	})

	// ── dialog ──
	function say(next: Dialog) {
		dialog = next
		revealed = prefersReducedMotion() ? next.text.length : 0
		window.clearTimeout(typeTimer)
		tick()
		handle.update()
	}

	function tick() {
		if (!dialog) return
		if (revealed >= dialog.text.length) {
			handle.update().then(() => {
				panel?.querySelector<HTMLElement>('[data-choice]')?.focus({ preventScroll: true })
			})
			return
		}
		typeTimer = window.setTimeout(() => {
			revealed += 2
			handle.update()
			tick()
		}, 22)
	}

	function skipTyping() {
		if (dialog && revealed < dialog.text.length) {
			revealed = dialog.text.length
			window.clearTimeout(typeTimer)
			tick()
			return true
		}
		return false
	}

	function close() {
		dialog = null
		window.clearTimeout(typeTimer)
		handle.update()
		root?.focus({ preventScroll: true })
	}

	function interact(obj: RoomObject): void {
		let { props } = handle
		let ok: Choice = { label: 'Cool', run: close }
		switch (obj.id) {
			case 'door':
				return say({
					speaker: 'Door',
					text: 'A door. Beyond it lies the professional world… also known as LinkedIn.',
					choices: [
						{ label: 'Step outside', href: props.linkedin, external: true },
						{ label: 'Stay in', run: close },
					],
				})
			case 'window':
				return say({
					speaker: 'Window',
					text:
						theme === 'dark'
							? 'The stars are out. It is peaceful. Maybe too peaceful. Open the curtains?'
							: 'What a lovely day outside. Perfect weather for staying in and writing code. Close the curtains?',
					choices: [
						{
							label: theme === 'dark' ? 'Let the sun in' : 'Call it a night',
							run: () => {
								toggleTheme()
								close()
							},
						},
						{ label: 'Leave it', run: close },
					],
				})
			case 'poster':
				return say({
					speaker: 'Poster',
					text: 'WANTED: Samuel Jensen, a.k.a. Sam, a.k.a. nichtsam. Known for writing code and occasionally writing about it. Approach with pull requests.',
					choices: [{ label: 'Noted', run: close }],
				})
			case 'bookshelf':
				return say({
					speaker: 'Bookshelf',
					text: 'My shelf of articles. Some of them are even finished. Pick one up?',
					choices: [
						...props.latest
							.slice(0, 2)
							.map((article) => ({ label: article.title, href: article.href })),
						{ label: 'Browse all articles', href: props.articlesHref },
						{ label: 'Maybe later', run: close },
					],
				})
			case 'desk':
				return say({
					speaker: 'Computer',
					text: 'The computer hums quietly. GitHub is open in about thirty-seven tabs.',
					choices: [
						{ label: 'Check out my GitHub', href: props.github, external: true },
						{ label: 'Close a few tabs', run: close },
					],
				})
			case 'plant': {
				let line = PLANT_LINES[plantStage]!
				plantStage = Math.min(3, plantStage + 1)
				try {
					localStorage.setItem('plant-stage', String(plantStage))
				} catch {}
				return say({ speaker: 'Plant', text: line, choices: [ok] })
			}
			case 'cat':
				spawnHearts()
				return say({
					speaker: 'Cat',
					text: 'Purrrr… The cat has decided you are acceptable. This is a great honour.',
					choices: [
						{ label: 'Pet again', run: () => interact(obj) },
						{ label: 'Leave it be', run: close },
					],
				})
			case 'boombox': {
				let duration = 2400
				try {
					duration = playJingle()
				} catch {}
				musicUntil = Date.now() + duration
				window.setTimeout(() => handle.update(), duration + 50)
				return say({
					speaker: 'Boombox',
					text: '♪ Now playing: 8-bit lo-fi beats to refactor to.',
					choices: [
						{ label: 'Encore!', run: () => interact(obj) },
						{ label: 'Nice', run: close },
					],
				})
			}
		}
	}

	function spawnHearts() {
		let ids = [heartId++, heartId++, heartId++]
		hearts.push(...ids)
		window.setTimeout(() => {
			hearts = hearts.filter((id) => !ids.includes(id))
			handle.update()
		}, 1200)
	}

	// ── movement ──
	function face(dir: Dir) {
		facing = dir
	}

	function tryStep(dir: Dir) {
		walkToken++
		face(dir)
		let [dx, dy] = DELTA[dir]
		let next: Tile = [pos[0] + dx, pos[1] + dy]
		if (walkable(next)) {
			pos = next
			stepping = !stepping
		}
		handle.update()
	}

	async function walkTo(target: Tile, then?: () => void) {
		let path = findPath(pos, target)
		if (!path) return
		let token = ++walkToken
		for (let tile of path) {
			let dx = tile[0] - pos[0]
			let dy = tile[1] - pos[1]
			face(dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down')
			pos = tile
			stepping = !stepping
			handle.update()
			await new Promise((resolve) =>
				window.setTimeout(resolve, prefersReducedMotion() ? 0 : STEP_MS),
			)
			if (token !== walkToken || handle.signal.aborted) return
		}
		stepping = false
		then?.()
		handle.update()
	}

	function goInteract(obj: RoomObject) {
		dialog = null
		let atSpot = pos[0] === obj.spot[0] && pos[1] === obj.spot[1]
		let finish = () => {
			face(obj.face)
			interact(obj)
		}
		if (atSpot) finish()
		else void walkTo(obj.spot, finish)
	}

	function useFacing() {
		let [dx, dy] = DELTA[facing]
		let target = objectAt([pos[0] + dx, pos[1] + dy])
		target ??= OBJECTS.find((obj) => obj.spot[0] === pos[0] && obj.spot[1] === pos[1])
		if (target) {
			face(target === objectAt([pos[0] + dx, pos[1] + dy]) ? facing : target.face)
			interact(target)
		} else {
			say({
				speaker: 'Sam',
				text: "There's nothing here. Just me and my thoughts.",
				choices: [{ label: 'Okay', run: close }],
			})
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey) return
		let target = event.target as HTMLElement | null
		if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
		let inRoom = !!root && (target === document.body || root.contains(target))
		if (!inRoom) return

		let key = event.key.toLowerCase()
		if (dialog) {
			if (key === 'escape') {
				event.preventDefault()
				close()
			} else if ((key === 'enter' || key === ' ' || key === 'e') && skipTyping()) {
				event.preventDefault()
			} else if (
				['arrowup', 'arrowdown', 'w', 's', 'arrowleft', 'arrowright', 'a', 'd'].includes(key)
			) {
				event.preventDefault()
				let choices = [...(panel?.querySelectorAll<HTMLElement>('[data-choice]') ?? [])]
				if (!choices.length) return
				let index = choices.indexOf(document.activeElement as HTMLElement)
				let forward = ['arrowdown', 's', 'arrowright', 'd'].includes(key)
				let next = (index + (forward ? 1 : -1) + choices.length) % choices.length
				choices[next]!.focus()
			}
			return
		}

		let dirs: Record<string, Dir> = {
			arrowup: 'up',
			w: 'up',
			arrowdown: 'down',
			s: 'down',
			arrowleft: 'left',
			a: 'left',
			arrowright: 'right',
			d: 'right',
		}
		let dir = dirs[key]
		if (dir) {
			event.preventDefault()
			tryStep(dir)
		} else if (key === 'e' || key === 'enter' || key === ' ') {
			if (target && target !== root && target !== document.body) return
			event.preventDefault()
			useFacing()
		}
	}

	function onFloorClick(event: MouseEvent & { currentTarget: HTMLElement }) {
		let rect = event.currentTarget.getBoundingClientRect()
		let x = Math.floor(((event.clientX - rect.left) / rect.width) * COLS)
		let y = Math.floor(((event.clientY - rect.top) / rect.height) * ROWS)
		dialog = null
		void walkTo([x, y])
		handle.update()
	}

	// ── render ──
	return () => {
		let sprite: Sprite =
			facing === 'up'
				? stepping
					? S.samBackStep
					: S.samBackIdle
				: facing === 'left'
					? stepping
						? S.samSideStepLeft
						: S.samSideIdleLeft
					: facing === 'right'
						? stepping
							? S.samSideStep
							: S.samSideIdle
						: stepping
							? S.samStep
							: S.samIdle
		let playing = hydrated && Date.now() < musicUntil
		let visibleText = dialog ? dialog.text.slice(0, revealed) : ''
		let typing = !!dialog && revealed < dialog.text.length

		return (
			<section
				className="room-game"
				aria-label="Sam's room, an interactive pixel scene"
				mix={gameStyle}
			>
				<div
					className="room"
					tabIndex={0}
					aria-describedby={`${handle.id}-help`}
					mix={[
						roomStyle,
						ref((node) => {
							root = node
						}),
					]}
					style={{ aspectRatio: `${W} / ${H}` }}
				>
					<div className="wall" aria-hidden="true" style={{ height: pct(WALL_ROWS * TILE, H) }} />
					<div
						className="floor"
						aria-hidden="true"
						mix={on('click', onFloorClick)}
						style={{ top: pct(WALL_ROWS * TILE, H) }}
					/>
					<div className="walk-layer" aria-hidden="true" mix={on('click', onFloorClick)} />

					<Placed x={96} y={88} sprite={S.rug} z={1} />

					{OBJECTS.map((obj) => {
						let sprites = spritesFor(obj.id, plantStage)
						let bottomRow = Math.max(...(obj.blocks ?? obj.tiles).map(([, y]) => y))
						let first = sprites[0]!
						return (
							<button
								key={obj.id}
								type="button"
								className={`obj obj-${obj.id}`}
								aria-label={obj.label}
								data-object={obj.id}
								mix={[objectStyle, on('click', () => goInteract(obj))]}
								style={{
									left: pct(obj.x, W),
									top: pct(obj.y, H),
									width: pct(first.w, W),
									height: pct(first.h, H),
									zIndex: bottomRow * 10,
								}}
							>
								{sprites.map((sprite, index) => (
									<PixelArt sprite={sprite} className={index === 0 ? 'frame-a' : 'frame-b'} />
								))}
								{obj.id === 'cat' &&
									hearts.map((id, index) => (
										<span
											key={id}
											className="heart"
											style={{ left: `${index * 35 - 10}%`, animationDelay: `${index * 120}ms` }}
										>
											<PixelArt sprite={S.heart} />
										</span>
									))}
								{obj.id === 'boombox' && playing && (
									<>
										<span className="music-note" style={{ left: '-30%' }}>
											<PixelArt sprite={S.note} />
										</span>
										<span className="music-note" style={{ left: '70%', animationDelay: '400ms' }}>
											<PixelArt sprite={S.note} />
										</span>
									</>
								)}
							</button>
						)
					})}

					<div
						className={`sam${stepping ? ' is-stepping' : ''}`}
						aria-hidden="true"
						style={{
							left: pct(pos[0] * TILE, W),
							top: pct((pos[1] + 1) * TILE - 20, H),
							width: pct(16, W),
							height: pct(20, H),
							zIndex: pos[1] * 10 + 5,
						}}
					>
						<div className="shadow" />
						<PixelArt sprite={sprite} />
					</div>

					<div className="night-tint" aria-hidden="true" />
				</div>

				<ul className="quick" aria-hidden="true" mix={quickStyle}>
					{OBJECTS.map((obj) => (
						<li key={obj.id}>
							<button type="button" tabIndex={-1} mix={on('click', () => goInteract(obj))}>
								{obj.label}
							</button>
						</li>
					))}
				</ul>

				<div
					className="dialog"
					aria-live="polite"
					mix={[
						dialogStyle,
						ref((node) => {
							panel = node
						}),
						on('click', (event) => {
							if ((event.target as HTMLElement).closest('[data-choice]')) return
							skipTyping()
						}),
					]}
				>
					{dialog ? (
						<>
							<p className="speaker">{dialog.speaker}</p>
							<p className="text">
								<span className="sr-only">{dialog.text}</span>
								<span aria-hidden="true">
									{visibleText}
									{typing && <span className="caret">▌</span>}
								</span>
							</p>
							{!typing && (
								<ul className="choices">
									{dialog.choices.map((choice) => (
										<li key={choice.label}>
											{choice.href ? (
												<a
													data-choice
													href={choice.href}
													target={choice.external ? '_blank' : undefined}
													rel={choice.external ? 'noreferrer' : undefined}
													mix={on('click', () => {
														dialog = null
														handle.update()
													})}
												>
													{choice.label}
													{choice.external && <span className="ext"> ↗</span>}
												</a>
											) : (
												<button data-choice type="button" mix={on('click', () => choice.run?.())}>
													{choice.label}
												</button>
											)}
										</li>
									))}
								</ul>
							)}
						</>
					) : (
						<>
							<p className="speaker">Sam</p>
							<p className="text" id={`${handle.id}-help`}>
								Welcome to my room! Click on anything that looks interesting, or walk around with{' '}
								<kbd>←</kbd>
								<kbd>↑</kbd>
								<kbd>↓</kbd>
								<kbd>→</kbd> and press <kbd>E</kbd> to interact.
							</p>
						</>
					)}
				</div>
			</section>
		)
	}
})

function spritesFor(id: ObjectId, plantStage: number): Sprite[] {
	switch (id) {
		case 'door':
			return [S.door]
		case 'window':
			return [S.windowDay, S.windowNight]
		case 'poster':
			return [S.poster]
		case 'bookshelf':
			return [S.bookshelf]
		case 'desk':
			return [S.desk]
		case 'plant':
			return [S.plants[plantStage]!]
		case 'cat':
			return [S.catA, S.catB]
		case 'boombox':
			return [S.boombox]
	}
}

function Placed(handle: Handle<{ x: number; y: number; sprite: Sprite; z: number }>) {
	return () => {
		let { x, y, sprite, z } = handle.props
		return (
			<div
				aria-hidden="true"
				style={{
					position: 'absolute',
					left: pct(x, W),
					top: pct(y, H),
					width: pct(sprite.w, W),
					height: pct(sprite.h, H),
					zIndex: z,
					pointerEvents: 'none',
				}}
			>
				<PixelArt sprite={sprite} style={{ width: '100%', height: '100%' }} />
			</div>
		)
	}
}

// ─── Styles ──────────────────────────────────────────────────────────────

const gameStyle = css({
	display: 'grid',
	gap: '20px',
})

const roomStyle = css({
	position: 'relative',
	width: '100%',
	overflow: 'hidden',
	border: 'var(--px) solid var(--line)',
	boxShadow: 'calc(var(--px) * 2) calc(var(--px) * 2) 0 var(--shadow)',
	background: '#e9d9b4',
	userSelect: 'none',
	'&:focus-visible': {
		outline: 'var(--px) dashed var(--accent)',
		outlineOffset: 'calc(var(--px) * 2)',
	},
	'& .wall': {
		position: 'absolute',
		inset: '0 0 auto 0',
		background: [
			'linear-gradient(to bottom, transparent calc(100% - 6%), #5e3a26 calc(100% - 6%))',
			'repeating-linear-gradient(90deg, #f3d9c4 0 6.25%, #edcdb5 6.25% 12.5%)',
		].join(','),
	},
	'& .floor': {
		position: 'absolute',
		inset: 'auto 0 0 0',
		bottom: 0,
		background: [
			'repeating-linear-gradient(to bottom, transparent 0 calc(20% - 2px), rgb(94 58 38 / 0.45) calc(20% - 2px) 20%)',
			'repeating-linear-gradient(90deg, #c99567 0 12.5%, #c08457 12.5% 25%)',
		].join(','),
	},
	'& .walk-layer': {
		position: 'absolute',
		inset: 0,
		zIndex: 0,
	},
	'& .sam': {
		position: 'absolute',
		pointerEvents: 'none',
		transition: `left ${STEP_MS}ms linear, top ${STEP_MS}ms linear`,
	},
	'& .sam svg': {
		position: 'relative',
		width: '100%',
		height: '100%',
	},
	'& .sam .shadow': {
		position: 'absolute',
		left: '12%',
		right: '12%',
		bottom: '-4%',
		height: '14%',
		background: 'rgb(34 32 58 / 0.25)',
	},
	'& .night-tint': {
		position: 'absolute',
		inset: 0,
		zIndex: 200,
		pointerEvents: 'none',
		background: 'rgb(22 18 70 / 0.42)',
		mixBlendMode: 'multiply',
		opacity: 0,
		transition: 'opacity 400ms steps(4)',
	},
	':root[data-theme="dark"] & .night-tint': {
		opacity: 1,
	},
	'@media (prefers-reduced-motion: reduce)': {
		'& .sam': { transition: 'none' },
	},
})

const objectStyle = css({
	position: 'absolute',
	padding: 0,
	margin: 0,
	border: 0,
	background: 'transparent',
	'& > svg': {
		width: '100%',
		height: '100%',
		transition: 'transform 120ms steps(2)',
	},
	'&:hover > svg, &:focus-visible > svg': {
		transform: 'translateY(-4%)',
		filter:
			'drop-shadow(0 0 0 var(--gold)) drop-shadow(2px 0 0 var(--gold)) drop-shadow(-2px 0 0 var(--gold)) drop-shadow(0 2px 0 var(--gold)) drop-shadow(0 -2px 0 var(--gold))',
	},
	'&:focus-visible': {
		outline: 'none',
	},
	'&.obj-window': { zIndex: 205 },
	'& .frame-b': { display: 'none' },
	'&.obj-window .frame-b': { position: 'absolute', inset: 0 },
	':root[data-theme="dark"] &.obj-window .frame-a': { display: 'none' },
	':root[data-theme="dark"] &.obj-window .frame-b': { display: 'block' },
	'&.obj-cat > svg': {
		position: 'absolute',
		inset: 0,
		animation: 'cat-tail 1.2s steps(1) infinite',
	},
	'&.obj-cat .frame-b': {
		display: 'block',
		animationDelay: '-0.6s',
	},
	'& .heart, & .music-note': {
		position: 'absolute',
		bottom: '90%',
		width: '60%',
		pointerEvents: 'none',
		animation: 'float-up 1.1s steps(6) forwards',
	},
	'& .music-note': {
		width: '45%',
		animation: 'float-up 1.2s steps(6) infinite',
	},
	'& .heart svg, & .music-note svg': { width: '100%', height: 'auto' },
	'@keyframes cat-tail': {
		'0%': { opacity: 1 },
		'50%': { opacity: 0 },
	},
	'@keyframes float-up': {
		from: { transform: 'translateY(0)', opacity: 1 },
		to: { transform: 'translateY(-160%)', opacity: 0 },
	},
})

// On small screens the sprites are tiny tap targets, so offer the objects as chips too.
const quickStyle = css({
	display: 'none',
	'@media (max-width: 640px)': {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px',
		listStyle: 'none',
		padding: 0,
		marginTop: '-4px',
	},
	'& button': {
		padding: '2px 10px',
		fontFamily: 'var(--font-label)',
		fontSize: '0.7rem',
		background: 'var(--surface)',
		border: '2px solid var(--line)',
		boxShadow: '0 2px 0 var(--shadow)',
	},
	'& button:active': {
		transform: 'translateY(2px)',
		boxShadow: 'none',
	},
})

const dialogStyle = css({
	position: 'relative',
	minHeight: '9.5rem',
	padding: '18px 22px 20px',
	background: 'var(--surface)',
	border: 'var(--px) solid var(--line)',
	boxShadow: 'calc(var(--px) * 2) calc(var(--px) * 2) 0 var(--shadow)',
	'&::before': {
		content: '""',
		position: 'absolute',
		inset: '4px',
		border: '2px solid var(--line)',
		opacity: 0.15,
		pointerEvents: 'none',
	},
	'& .speaker': {
		position: 'absolute',
		top: '-16px',
		left: '16px',
		padding: '0 10px',
		background: 'var(--accent)',
		color: 'var(--accent-ink)',
		border: 'var(--px) solid var(--line)',
		fontFamily: 'var(--font-label)',
		fontSize: '0.8rem',
		lineHeight: 1.6,
	},
	'& .text': {
		fontSize: '1.05rem',
		lineHeight: 1.6,
		marginTop: '6px',
	},
	'& .caret': {
		animation: 'blink 0.6s steps(1) infinite',
		color: 'var(--accent)',
	},
	'& kbd': {
		display: 'inline-block',
		minWidth: '1.6em',
		margin: '0 2px',
		padding: '0 4px',
		textAlign: 'center',
		fontFamily: 'var(--font-label)',
		fontSize: '0.75rem',
		lineHeight: 1.6,
		background: 'var(--surface-2)',
		border: '2px solid var(--line)',
		boxShadow: '0 2px 0 var(--line)',
	},
	'& .choices': {
		listStyle: 'none',
		padding: 0,
		marginTop: '12px',
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px 20px',
	},
	'& [data-choice]': {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		padding: '2px 6px 2px 20px',
		position: 'relative',
		border: 0,
		background: 'transparent',
		fontFamily: 'var(--font-display)',
		fontSize: '1.05rem',
		fontWeight: 500,
		textDecoration: 'none',
		color: 'var(--ink)',
	},
	'& [data-choice]::before': {
		content: '"▶"',
		position: 'absolute',
		left: '2px',
		fontSize: '0.75em',
		color: 'var(--accent)',
		opacity: 0,
	},
	'& [data-choice]:hover, & [data-choice]:focus-visible': {
		outline: 'none',
		background: 'var(--gold)',
		color: '#22203a',
	},
	'& [data-choice]:hover::before, & [data-choice]:focus-visible::before': {
		opacity: 1,
		animation: 'nudge 0.5s steps(2) infinite',
		color: '#22203a',
	},
	'@keyframes blink': {
		'50%': { opacity: 0 },
	},
	'@keyframes nudge': {
		'50%': { transform: 'translateX(3px)' },
	},
})
