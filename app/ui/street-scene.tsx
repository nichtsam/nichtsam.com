import type { Handle, RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'
import { createPen, InkPaths, type Ink, type PenApi } from './sketch.tsx'
import { site } from './site.ts'

/**
 * A pen-and-ink panorama of the street Sam lives on. Every building is part of
 * the site: the bookshop leads to the articles, the workshop to GitHub, the
 * tower to LinkedIn. Rendered on the server; `SceneControls` adds the
 * interactive bits (lights, the clock, knocking on Sam's door, parallax).
 */

export const SCENE_ID = 'street-scene'
export const SAM_LINES = [
	"Hi there, I'm Sam.",
	'You can call me Sam.',
	'Oh, and this is my website by the way.',
	'Click the windows. I dare you.',
	"The bookshop has everything I've written.",
	'Okay, go explore!',
]

const W = 1600
const H = 720
const GROUND = 600

// Deterministic "random" so server output is stable.
function prng(seed: number) {
	return () => {
		seed = (seed * 16807) % 2147483647
		return (seed - 1) / 2147483646
	}
}

function windowEl(
	pen: PenApi,
	x: number,
	y: number,
	w: number,
	h: number,
	night: boolean,
	cross = true,
) {
	return (
		<g className="window">
			<rect className={night ? 'win n' : 'win'} data-win x={x} y={y} width={w} height={h} />
			<InkPaths ink={pen.rect(x, y, w, h, { thin: true })} />
			{cross && <InkPaths ink={pen.line(x + w / 2, y + 2, x + w / 2, y + h - 2, { thin: true })} />}
		</g>
	)
}

function windowGrid(
	pen: PenApi,
	rand: () => number,
	opts: {
		x: number
		y: number
		cols: number
		rows: number
		w: number
		h: number
		dx: number
		dy: number
	},
) {
	let out: RemixNode[] = []
	for (let r = 0; r < opts.rows; r++) {
		for (let c = 0; c < opts.cols; c++) {
			out.push(
				windowEl(pen, opts.x + c * opts.dx, opts.y + r * opts.dy, opts.w, opts.h, rand() < 0.4),
			)
		}
	}
	return out
}

function awning(pen: PenApi, x: number, y: number, w: number, depth: number, stripes: number) {
	let parts: Ink[] = []
	parts.push(
		...pen.poly(
			[
				[x + 6, y],
				[x + w - 6, y],
				[x + w + 8, y + depth],
				[x - 8, y + depth],
			],
			{ paper: true },
		),
	)
	let step = (w + 16) / stripes
	for (let i = 0; i < stripes; i += 2) {
		let top0 = x + 6 + ((w - 12) / stripes) * i
		let top1 = x + 6 + ((w - 12) / stripes) * (i + 1)
		let bot0 = x - 8 + step * i
		let bot1 = x - 8 + step * (i + 1)
		parts.push(
			...pen.poly(
				[
					[top0, y],
					[top1, y],
					[bot1, y + depth],
					[bot0, y + depth],
				],
				{ hatch: 4, thin: true },
			),
		)
	}
	for (let i = 0; i < stripes; i++) {
		parts.push(
			...pen.arc(x - 8 + step * (i + 0.5), y + depth, step, step * 0.7, 0, Math.PI, {
				thin: true,
				paper: true,
			}),
		)
	}
	return parts
}

function stick(pen: PenApi, x: number, y: number, scale = 1, wave = false) {
	let s = scale
	return [
		...pen.circle(x, y, 10 * s, { thin: true, paper: true }),
		...pen.line(x, y + 5 * s, x, y + 22 * s, { thin: true }),
		...pen.line(x, y + 10 * s, x - 7 * s, y + 18 * s, { thin: true }),
		...(wave
			? pen.line(x, y + 10 * s, x + 8 * s, y + 1 * s, { thin: true })
			: pen.line(x, y + 10 * s, x + 7 * s, y + 18 * s, { thin: true })),
		...pen.line(x, y + 22 * s, x - 5 * s, y + 33 * s, { thin: true }),
		...pen.line(x, y + 22 * s, x + 5 * s, y + 33 * s, { thin: true }),
	]
}

function cloudPath(x: number, y: number, s: number) {
	return `M${x} ${y} c ${-22 * s} 0 ${-26 * s} ${-24 * s} ${-6 * s} ${-28 * s} c ${2 * s} ${-22 * s} ${34 * s} ${-28 * s} ${44 * s} ${-10 * s} c ${12 * s} ${-18 * s} ${44 * s} ${-8 * s} ${40 * s} ${14 * s} c ${20 * s} ${2 * s} ${20 * s} ${26 * s} 0 ${24 * s} z`
}

function Sign(
	handle: Handle<{
		pen: PenApi
		x: number
		y: number
		w: number
		h: number
		text: string
		size?: number
	}>,
) {
	return () => {
		let { pen, x, y, w, h, text, size = 20 } = handle.props
		return (
			<g className="sign">
				<InkPaths ink={pen.rect(x, y, w, h, { paper: true, strokeWidth: 2 })} />
				<g className="sign-hatch">
					<InkPaths ink={pen.rect(x + 4, y + 4, w - 8, h - 8, { hatch: 5, stroke: 'none' })} />
				</g>
				<text x={x + w / 2} y={y + h / 2 + size * 0.36} className="sign-text" fontSize={size}>
					{text}
				</text>
			</g>
		)
	}
}

export function StreetScene() {
	return () => {
		let pen = createPen({ seed: 1, roughness: 1.3 })
		let rand = prng(7)

		// ── sky ──
		let stars = Array.from({ length: 26 }, () => [rand() * W, 20 + rand() * 260] as const)
		let sky = (
			<g className="layer sky">
				<g className="sun">
					<InkPaths ink={pen.circle(1480, 100, 70, { strokeWidth: 2 })} />
					{Array.from({ length: 10 }, (_, i) => {
						let a = (i / 10) * Math.PI * 2
						return (
							<InkPaths
								ink={pen.line(
									1480 + Math.cos(a) * 46,
									100 + Math.sin(a) * 46,
									1480 + Math.cos(a) * 62,
									100 + Math.sin(a) * 62,
									{ thin: true },
								)}
							/>
						)
					})}
				</g>
				<g className="moon">
					<InkPaths
						ink={pen.path('M1500 60 C 1450 60, 1440 140, 1500 146 C 1470 128, 1468 80, 1500 60 Z', {
							hatch: 4,
						})}
					/>
					{stars.map(([x, y]) => (
						<InkPaths
							ink={[
								...pen.line(x - 4, y, x + 4, y, { thin: true }),
								...pen.line(x, y - 4, x, y + 4, { thin: true }),
							]}
						/>
					))}
				</g>
				<g className="clouds">
					<g className="cloud c1">
						<InkPaths ink={pen.path(cloudPath(250, 110, 1.3), { paper: true })} />
					</g>
					<g className="cloud c2">
						<InkPaths ink={pen.path(cloudPath(820, 70, 1))} />
					</g>
					<g className="cloud c3">
						<InkPaths ink={pen.path(cloudPath(1150, 50, 0.8))} />
					</g>
				</g>
				<g className="birds">
					{[
						[560, 120],
						[585, 108],
						[606, 126],
					].map(([x, y]) => (
						<InkPaths
							ink={pen.curve(
								[
									[x!, y!],
									[x! + 7, y! - 6],
									[x! + 13, y!],
									[x! + 20, y! - 6],
									[x! + 26, y!],
								],
								{ thin: true },
							)}
						/>
					))}
				</g>
			</g>
		)

		// ── far skyline ──
		let far = (
			<g className="layer far">
				{[
					[0, 330, 70],
					[200, 280, 60],
					[360, 250, 70],
					[520, 300, 80],
					[900, 260, 90],
					[1100, 310, 70],
					[1300, 230, 60],
					[1540, 300, 70],
				].map(([x, top, w]) => (
					<InkPaths ink={pen.rect(x!, top!, w!, GROUND - top!, { thin: true })} />
				))}
			</g>
		)

		// ── 1. apartment A ──
		let apartmentA = (
			<g className="bld deco">
				<InkPaths
					ink={[
						...pen.line(72, 160, 78, 118, { thin: true }),
						...pen.line(112, 160, 106, 118, { thin: true }),
						...pen.line(74, 140, 110, 138, { thin: true }),
						...pen.rect(64, 84, 56, 38, { paper: true }),
						...pen.poly(
							[
								[60, 86],
								[92, 60],
								[124, 86],
							],
							{ hatch: 5 },
						),
					]}
				/>
				<InkPaths ink={pen.rect(30, 170, 170, 430, { paper: true, strokeWidth: 2 })} />
				<InkPaths ink={pen.rect(24, 160, 182, 14, { paper: true })} />
				{windowGrid(pen, rand, { x: 44, y: 192, cols: 4, rows: 7, w: 24, h: 34, dx: 38, dy: 46 })}
				<InkPaths
					ink={[
						...pen.path('M96 600 V 548 C 96 530, 132 530, 132 548 V 600', { paper: true }),
						...pen.line(114, 536, 114, 600, { thin: true }),
						...pen.rect(90, 596, 48, 6, { thin: true }),
					]}
				/>
				{[
					[38, 520],
					[160, 548],
					[170, 300],
				].map(([x, y]) => (
					<InkPaths ink={pen.rect(x!, y!, 22, 12, { hatch: 3, thin: true })} />
				))}
			</g>
		)

		// ── 2. Sam's house ──
		let house = (
			<g
				className="bld house"
				role="button"
				{...{ tabindex: 0 }}
				aria-label="Knock on Sam's door"
				data-house
			>
				<InkPaths ink={pen.rect(318, 362, 20, 46, { paper: true })} />
				<InkPaths ink={pen.rect(220, 430, 140, 170, { paper: true, strokeWidth: 2 })} />
				<InkPaths
					ink={pen.poly(
						[
							[206, 434],
							[290, 352],
							[374, 434],
						],
						{ paper: true, strokeWidth: 2 },
					)}
				/>
				<InkPaths
					ink={pen.poly(
						[
							[214, 430],
							[290, 358],
							[366, 430],
						],
						{ hatch: 6, stroke: 'none' },
					)}
				/>
				<InkPaths ink={pen.circle(290, 400, 30, { paper: true })} />
				<InkPaths ink={stick(pen, 290, 394, 0.55, true)} />
				<InkPaths
					ink={[
						...pen.rect(266, 516, 40, 84, { paper: true }),
						...pen.circle(298, 560, 5, { thin: true }),
						...pen.rect(274, 526, 24, 22, { thin: true }),
					]}
				/>
				{windowEl(pen, 234, 456, 28, 36, true)}
				{windowEl(pen, 318, 456, 28, 36, false)}
				<text x={286} y={541} className="tiny-text">
					hi!
				</text>
				<InkPaths
					ink={[
						...pen.line(380, 600, 380, 566, { thin: true }),
						...pen.rect(368, 548, 26, 18, { paper: true }),
						...pen.line(392, 552, 400, 546, { thin: true }),
					]}
				/>
				<g className="kite">
					<InkPaths
						ink={[
							...pen.curve(
								[
									[292, 352],
									[320, 300],
									[372, 240],
									[398, 190],
									[430, 150],
								],
								{ thin: true, roughness: 0.4 },
							),
							...pen.poly(
								[
									[430, 118],
									[450, 146],
									[430, 178],
									[410, 146],
								],
								{ paper: true },
							),
							...pen.poly(
								[
									[430, 118],
									[450, 146],
									[430, 146],
								],
								{ hatch: 3, stroke: 'none' },
							),
							...pen.line(430, 118, 430, 178, { thin: true }),
							...pen.line(410, 146, 450, 146, { thin: true }),
							...pen.curve(
								[
									[430, 178],
									[440, 196],
									[424, 214],
									[436, 234],
								],
								{ thin: true },
							),
						]}
					/>
				</g>
				<g className="bubble" data-bubble aria-hidden="true">
					<InkPaths
						ink={pen.path(
							'M190 250 C 190 214, 390 214, 390 250 C 390 286, 330 290, 300 288 L 292 318 L 276 287 C 230 286, 190 280, 190 250 Z',
							{ paper: true, strokeWidth: 2 },
						)}
					/>
					<text x={290} y={258} className="bubble-text" data-says>
						{SAM_LINES[0]}
					</text>
				</g>
			</g>
		)

		// ── 3. bookshop (articles) ──
		let books: Ink[] = []
		let bookRand = prng(3)
		for (let shelf of [538, 574]) {
			books.push(...pen.line(400, shelf, 516, shelf, { thin: true }))
			let x = 406
			while (x < 508) {
				let w = 5 + Math.round(bookRand() * 5)
				let h = 16 + Math.round(bookRand() * 12)
				books.push(
					...pen.rect(x, shelf - h, w, h, {
						thin: true,
						...(bookRand() < 0.35 ? { hatch: 2 } : {}),
					}),
				)
				x += w + 1
			}
		}
		let bookshop = (
			<a
				href={routes.articles.index.href()}
				className="bld link"
				aria-label="Bookshop: read my articles"
				data-label="articles →"
			>
				<InkPaths ink={pen.rect(380, 330, 230, 270, { paper: true, strokeWidth: 2 })} />
				<InkPaths ink={pen.rect(372, 322, 246, 16, { paper: true })} />
				<Sign pen={pen} x={398} y={350} w={194} h={50} text="BOOKS & ARTICLES" size={17} />
				<InkPaths ink={awning(pen, 384, 416, 222, 52, 10)} />
				<InkPaths ink={pen.rect(398, 486, 120, 94, { paper: true })} />
				<InkPaths ink={books} />
				<InkPaths
					ink={[
						...pen.rect(538, 486, 54, 114, { paper: true }),
						...pen.rect(546, 496, 38, 42, { thin: true }),
						...pen.circle(582, 556, 5, { thin: true }),
						...pen.rect(549, 506, 32, 16, { thin: true, paper: true }),
					]}
				/>
				<text x={565} y={518} className="tiny-text">
					OPEN
				</text>
			</a>
		)

		// ── 4. clock tower ──
		let ticks = Array.from({ length: 12 }, (_, i) => {
			let a = (i / 12) * Math.PI * 2
			return pen.line(
				680 + Math.cos(a) * 24,
				246 + Math.sin(a) * 24,
				680 + Math.cos(a) * 30,
				246 + Math.sin(a) * 30,
				{ thin: true },
			)
		}).flat()
		let clockTower = (
			<g className="bld deco tower">
				<InkPaths
					ink={[
						...pen.line(680, 112, 680, 78, { thin: true }),
						...pen.circle(680, 74, 8, { thin: true, paper: true }),
						...pen.path('M630 178 C 630 104, 730 104, 730 178 Z', { paper: true, strokeWidth: 2 }),
						...pen.line(680, 114, 680, 178, { thin: true }),
						...pen.curve(
							[
								[656, 124],
								[648, 150],
								[646, 178],
							],
							{ thin: true },
						),
						...pen.curve(
							[
								[704, 124],
								[712, 150],
								[714, 178],
							],
							{ thin: true },
						),
						...pen.rect(620, 176, 120, 18, { paper: true }),
						...pen.rect(630, 194, 100, 406, { paper: true, strokeWidth: 2 }),
						...pen.circle(680, 246, 72, { paper: true, strokeWidth: 2 }),
						...ticks,
					]}
				/>
				<line
					id="clock-hour"
					x1={680}
					y1={246}
					x2={680}
					y2={228}
					className="hand hour"
					transform="rotate(305 680 246)"
				/>
				<line
					id="clock-minute"
					x1={680}
					y1={246}
					x2={680}
					y2={218}
					className="hand minute"
					transform="rotate(60 680 246)"
				/>
				<InkPaths
					ink={[
						...pen.circle(680, 246, 5, { thin: true, hatch: 2 }),
						...pen.rect(662, 310, 36, 60, { thin: true }),
						...pen.rect(662, 400, 36, 60, { thin: true }),
						...pen.path('M656 600 V 540 C 656 510, 704 510, 704 540 V 600', { paper: true }),
						...pen.rect(636, 480, 24, 12, { hatch: 3, thin: true }),
						...pen.rect(700, 560, 24, 12, { hatch: 3, thin: true }),
					]}
				/>
			</g>
		)

		// ── 5. workshop (GitHub) ──
		let teeth: Ink[] = []
		for (let i = 0; i < 4; i++) {
			let x = 748 + i * 55
			teeth.push(
				...pen.poly(
					[
						[x, 422],
						[x, 384],
						[x + 55, 422],
					],
					{ paper: true, strokeWidth: 2 },
				),
			)
			teeth.push(
				...pen.poly(
					[
						[x + 3, 418],
						[x + 3, 392],
						[x + 44, 418],
					],
					{ hatch: 5, stroke: 'none' },
				),
			)
		}
		let doorLines = Array.from({ length: 10 }, (_, i) =>
			pen.line(776, 494 + i * 10, 888, 494 + i * 10, { thin: true }),
		).flat()
		let workshop = (
			<a
				href={site.social.github}
				target="_blank"
				rel="noreferrer"
				className="bld link"
				aria-label="Workshop: my GitHub"
				data-label="github ↗"
			>
				<InkPaths ink={teeth} />
				<InkPaths ink={pen.rect(750, 420, 222, 180, { paper: true, strokeWidth: 2 })} />
				<Sign pen={pen} x={770} y={432} w={182} h={38} text="GITHUB WORKSHOP" size={15} />
				<InkPaths ink={pen.rect(772, 484, 120, 116, { paper: true })} />
				<InkPaths ink={doorLines} />
				<InkPaths
					ink={[
						...pen.rect(820, 586, 24, 6, { thin: true }),
						...pen.rect(906, 510, 46, 90, { paper: true }),
						...pen.rect(914, 520, 30, 30, { thin: true }),
						...pen.circle(944, 566, 5, { thin: true }),
					]}
				/>
			</a>
		)

		// ── 6. billboard ──
		let billboard = (
			<g className="bld deco billboard">
				<InkPaths
					ink={[
						...pen.line(1030, 300, 1030, 434, { strokeWidth: 2 }),
						...pen.line(1140, 300, 1140, 434, { strokeWidth: 2 }),
						...pen.line(1030, 330, 1140, 380, { thin: true }),
						...pen.line(1140, 330, 1030, 380, { thin: true }),
						...pen.rect(990, 140, 190, 162, { paper: true, strokeWidth: 2.4 }),
						...pen.rect(1000, 150, 170, 142, { thin: true }),
					]}
				/>
				<text x={1085} y={168} className="dots">
					• • •
				</text>
				{['HI THERE,', "I'M SAM.", 'YOU CAN CALL', 'ME SAM.'].map((line, i) => (
					<text x={1085} y={200 + i * 23} className="billboard-text">
						{line}
					</text>
				))}
				<text x={1085} y={290} className="dots">
					• • •
				</text>
			</g>
		)

		// ── 7. café ──
		let cafe = (
			<g className="bld deco cafe">
				<InkPaths ink={pen.rect(985, 434, 180, 166, { paper: true, strokeWidth: 2 })} />
				<Sign pen={pen} x={1004} y={444} w={142} h={34} text="CAFÉ" size={22} />
				<InkPaths ink={awning(pen, 988, 484, 174, 30, 8)} />
				<InkPaths
					ink={[
						...pen.rect(1000, 530, 90, 62, { paper: true }),
						...pen.line(1045, 580, 1045, 592, { thin: true }),
						...pen.line(1030, 578, 1060, 578, { thin: true }),
						...stick(pen, 1020, 548, 0.7),
						...stick(pen, 1072, 548, 0.7),
						...pen.rect(1104, 526, 48, 74, { paper: true }),
						...pen.circle(1144, 566, 4, { thin: true }),
					]}
				/>
				<g className="cup">
					<InkPaths
						ink={[
							...pen.line(1165, 470, 1184, 470, { thin: true }),
							...pen.path('M1172 474 H 1196 V 490 C 1196 500, 1172 500, 1172 490 Z', {
								paper: true,
							}),
							...pen.arc(1198, 484, 10, 10, -Math.PI / 2, Math.PI / 2, { thin: true }),
						]}
					/>
					<g className="steam">
						<InkPaths
							ink={pen.curve(
								[
									[1180, 468],
									[1176, 458],
									[1184, 450],
									[1180, 440],
								],
								{ thin: true },
							)}
						/>
						<InkPaths
							ink={pen.curve(
								[
									[1189, 468],
									[1185, 458],
									[1193, 450],
									[1189, 440],
								],
								{ thin: true },
							)}
						/>
					</g>
				</g>
			</g>
		)

		// ── 8. tower (LinkedIn) ──
		let grid: Ink[] = []
		let glass: RemixNode[] = []
		for (let c = 0; c < 6; c++) {
			for (let r = 0; r < 11; r++) {
				let x = 1200 + c * 27
				let y = 140 + r * 34
				glass.push(
					<rect
						className={rand() < 0.45 ? 'win n' : 'win'}
						data-win
						x={x + 2}
						y={y + 2}
						width={23}
						height={30}
					/>,
				)
			}
		}
		for (let c = 0; c <= 6; c++)
			grid.push(...pen.line(1200 + c * 27, 138, 1200 + c * 27, 516, { thin: true }))
		for (let r = 0; r <= 11; r++)
			grid.push(...pen.line(1198, 140 + r * 34, 1364, 140 + r * 34, { thin: true }))
		let tower = (
			<a
				href={site.social.linkedin}
				target="_blank"
				rel="noreferrer"
				className="bld link"
				aria-label="Office tower: my LinkedIn"
				data-label="linkedin ↗"
			>
				<InkPaths
					ink={[
						...pen.line(1282, 96, 1282, 36, { strokeWidth: 2 }),
						...pen.rect(1206, 94, 152, 28, { paper: true }),
						...pen.rect(1185, 120, 194, 480, { paper: true, strokeWidth: 2 }),
					]}
				/>
				<circle cx={1282} cy={34} r={5} className="beacon" />
				{glass}
				<InkPaths ink={grid} />
				<InkPaths ink={pen.rect(1206, 140, 40, 60, { hatch: 6, stroke: 'none' })} />
				<Sign pen={pen} x={1206} y={526} w={152} h={30} text="LINKEDIN TOWER" size={14} />
				<InkPaths
					ink={[
						...pen.rect(1254, 562, 56, 38, { paper: true }),
						...pen.line(1282, 562, 1282, 600, { thin: true }),
						...pen.line(1256, 580, 1308, 580, { thin: true }),
					]}
				/>
			</a>
		)

		// ── 9. apartment B ──
		let balconies = [0, 2, 4]
			.map((r) =>
				[0, 1, 2].map((c) => {
					let x = 1400 + c * 58
					let y = 300 + r * 48 + 38
					return pen.lines(
						[
							[x - 6, y],
							[x - 6, y + 12],
							[x + 42, y + 12],
							[x + 42, y],
						],
						{ thin: true },
					)
				}),
			)
			.flat(2)
		let apartmentB = (
			<g className="bld deco">
				<InkPaths ink={pen.rect(1385, 262, 196, 338, { paper: true, strokeWidth: 2 })} />
				<InkPaths ink={pen.rect(1379, 252, 208, 14, { paper: true })} />
				{windowGrid(pen, rand, { x: 1400, y: 286, cols: 3, rows: 6, w: 36, h: 36, dx: 58, dy: 48 })}
				<InkPaths ink={balconies} />
				<InkPaths
					ink={[
						...stick(pen, 1476, 390, 0.5, true),
						...pen.rect(1452, 540, 50, 60, { paper: true }),
						...pen.circle(1494, 572, 4, { thin: true }),
						...pen.rect(1402, 330, 12, 10, { thin: true }),
						...pen.curve(
							[
								[1404, 330],
								[1400, 318],
								[1408, 312],
								[1412, 320],
							],
							{ thin: true },
						),
					]}
				/>
			</g>
		)

		// ── street ──
		let street: Ink[] = []
		street.push(...pen.line(0, GROUND, W, GROUND, { strokeWidth: 2.2, roughness: 0.6 }))
		for (let x = 10; x < W; x += 44)
			street.push(...pen.line(x, GROUND + 2, x - 8, 640, { thin: true }))
		street.push(...pen.line(0, 620, W, 620, { thin: true }))
		street.push(...pen.line(0, 640, W, 640, { strokeWidth: 2.2, roughness: 0.6 }))
		street.push(...pen.line(0, 648, W, 648, { thin: true }))
		for (let x = 30; x < W; x += 90)
			street.push(...pen.line(x, 688, x + 44, 688, { strokeWidth: 2.4 }))
		let pebbleRand = prng(11)
		for (let i = 0; i < 26; i++) {
			let x = pebbleRand() * W
			let y = 660 + pebbleRand() * 54
			street.push(...pen.arc(x, y, 8, 5, Math.PI, Math.PI * 2, { thin: true }))
		}
		street.push(...pen.rect(500, 606, 50, 10, { hatch: 3, thin: true }))

		let lamps = [366, 740, 976, 1380].map((x) => (
			<g className="lamp">
				<circle cx={x + 14} cy={482} r={26} className="glow" />
				<InkPaths
					ink={[
						...pen.line(x, 626, x, 470, { strokeWidth: 2 }),
						...pen.curve(
							[
								[x, 470],
								[x + 4, 462],
								[x + 14, 462],
							],
							{ thin: true },
						),
						...pen.poly(
							[
								[x + 6, 466],
								[x + 22, 466],
								[x + 18, 476],
								[x + 10, 476],
							],
							{ paper: true },
						),
						...pen.rect(x - 5, 620, 10, 8, { thin: true }),
					]}
				/>
			</g>
		))

		let car = (
			<g className="mover car">
				<InkPaths
					ink={[
						...pen.path(
							'M0 60 C 0 44, 8 40, 26 38 L 44 16 C 50 10, 96 8, 108 16 L 126 38 C 146 40, 152 46, 152 60 Z',
							{ paper: true, strokeWidth: 2 },
						),
						...pen.path('M50 36 L 60 20 H 76 V 36 Z', { thin: true }),
						...pen.path('M82 36 V 20 H 100 L 112 36 Z', { thin: true }),
						...pen.line(80, 38, 80, 58, { thin: true }),
						...pen.circle(34, 60, 22, { paper: true, strokeWidth: 2 }),
						...pen.circle(118, 60, 22, { paper: true, strokeWidth: 2 }),
						...pen.circle(34, 60, 6, { thin: true }),
						...pen.circle(118, 60, 6, { thin: true }),
					]}
				/>
			</g>
		)

		let walker = (
			<g className="mover walker">
				<InkPaths
					ink={[
						...stick(pen, 20, 0, 1.25),
						...pen.curve(
							[
								[28, 22],
								[40, 30],
								[52, 30],
							],
							{ thin: true },
						),
						...pen.ellipse(62, 34, 22, 10, { thin: true, paper: true }),
						...pen.circle(74, 28, 9, { thin: true, paper: true }),
						...pen.line(56, 38, 54, 44, { thin: true }),
						...pen.line(68, 38, 70, 44, { thin: true }),
						...pen.line(51, 32, 45, 28, { thin: true }),
					]}
				/>
			</g>
		)

		return (
			<div className="scene" id={SCENE_ID}>
				<svg
					viewBox={`0 0 ${W} ${H}`}
					role="group"
					aria-label="A hand-drawn street. Each building leads somewhere on this site."
				>
					{sky}
					{far}
					<g className="layer main">
						{apartmentA}
						{house}
						{bookshop}
						{clockTower}
						{workshop}
						{billboard}
						{cafe}
						{tower}
						{apartmentB}
					</g>
					<g className="layer street">
						<InkPaths ink={street} />
						<g transform="translate(0 575)">{walker}</g>
						<g transform="translate(0 626)">{car}</g>
						{lamps}
					</g>
				</svg>
				<p className="scene-tip" aria-hidden="true" data-tip />
			</div>
		)
	}
}
