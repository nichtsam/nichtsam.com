import { Pencil, THIN } from './pencil.ts'

/**
 * Fixed-size drawings. Unlike the shapes in `pencil.ts`, these scale as a
 * whole with their viewBox, so they are drawn once and never refit.
 */

interface DoodleDef {
	width: number
	height: number
	/** Where the drawing starts, when it doesn't fill its canvas from the top. */
	top?: number
	draw(p: Pencil): void
}

const ground = (p: Pencil) =>
	p.curve(
		[
			[40, 404],
			[260, 398],
			[480, 404],
		],
		{ ...THIN, double: false },
	)

export const doodles = {
	/** Sam's desk: lamp, monitor, a stack of books and a mug. The lamp is a switch. */
	desk: {
		width: 520,
		height: 330,
		top: 90,
		draw(p) {
			// desk, drawer, floor; shadows fall right, away from the lamp
			p.box(18, 300, 486, 12, { over: 10 })
			p.hatchRect(28, 312, 470, 7, 3.5)
			p.line(38, 312, 38, 400)
			p.line(484, 312, 484, 400)
			p.box(356, 312, 118, 62, { over: 6 })
			p.line(398, 336, 432, 336, THIN)
			ground(p)
			// monitor and what's on it
			p.box(146, 138, 196, 128, { over: 8 })
			p.rect(158, 150, 172, 104, THIN)
			p.rect(234, 266, 20, 26)
			p.ellipse(244, 296, 84, 9)
			let code = [
				[0, 70],
				[14, 96],
				[14, 58],
				[28, 80],
				[14, 40],
				[0, 24],
			] as const
			code.forEach(([indent, length], i) =>
				p.line(172 + indent, 170 + i * 13, 172 + indent + length, 170 + i * 13, THIN),
			)
			// books with a mug on top
			p.box(392, 278, 96, 21, { over: 5 })
			p.hatchRect(478, 280, 9, 18, 3)
			p.box(402, 258, 80, 20, { over: 5 })
			p.box(388, 240, 90, 18, { over: 5 })
			p.rect(424, 208, 30, 32)
			p.arc(454, 224, 16, 16, -Math.PI / 2, Math.PI / 2)
			// the lamp
			p.ellipse(70, 296, 58, 9)
			p.line(70, 292, 40, 222, { width: 1.9 })
			p.circle(40, 222, 8)
			p.line(40, 222, 58, 164, { width: 1.9 })
			p.polygon([
				[52, 166],
				[68, 156],
				[104, 184],
				[60, 210],
			])
			p.hatch(
				[
					[52, 166],
					[68, 156],
					[80, 166],
					[58, 180],
				],
				3,
			)
		},
	},

	/** An open notebook, a note and a pencil. */
	book: {
		width: 520,
		height: 330,
		top: 90,
		draw(p) {
			p.polygon([
				[110, 250],
				[260, 282],
				[260, 382],
				[110, 350],
			])
			p.polygon([
				[260, 282],
				[410, 250],
				[410, 350],
				[260, 382],
			])
			p.curve(
				[
					[110, 350],
					[180, 372],
					[260, 392],
				],
				THIN,
			)
			p.curve(
				[
					[260, 392],
					[340, 372],
					[410, 350],
				],
				THIN,
			)
			for (let i = 0; i < 5; i++)
				p.line(130, 276 + i * 15, 238 - (i === 4 ? 40 : 0), 298 + i * 15, THIN)
			for (let i = 0; i < 4; i++)
				p.line(282, 298 + i * 15, 390 - (i === 3 ? 50 : 0), 276 + i * 15, THIN)
			p.polygon([
				[300, 160],
				[440, 104],
				[450, 118],
				[310, 174],
			])
			p.lines([
				[300, 160],
				[284, 172],
				[310, 174],
			])
			p.hatch(
				[
					[300, 160],
					[440, 104],
					[443, 110],
					[304, 166],
				],
				2.5,
			)
			p.box(90, 130, 110, 80, { over: 7 })
			p.line(104, 152, 184, 152, THIN)
			p.line(104, 170, 170, 170, THIN)
			p.line(104, 188, 150, 188, THIN)
			ground(p)
		},
	},

	/** A browser window being sketched, with a ruler leaning on it. */
	browser: {
		width: 520,
		height: 330,
		top: 90,
		draw(p) {
			p.box(90, 110, 330, 230, { over: 9 })
			p.line(90, 146, 420, 146)
			p.circle(110, 128, 9, THIN)
			p.circle(128, 128, 9, THIN)
			p.circle(146, 128, 9, THIN)
			p.box(114, 168, 130, 90, { over: 5 })
			p.line(126, 168, 244, 258, THIN)
			p.line(244, 168, 126, 258, THIN)
			p.line(268, 176, 396, 176, THIN)
			p.line(268, 196, 380, 196, THIN)
			p.line(268, 216, 390, 216, THIN)
			p.line(268, 236, 340, 236, THIN)
			p.box(114, 282, 282, 34, { over: 5 })
			p.hatchRect(114, 282, 90, 34, 4)
			p.polygon([
				[430, 380],
				[470, 190],
				[484, 192],
				[446, 382],
			])
			for (let i = 0; i < 7; i++) {
				p.line(471 - i * 4.4, 210 + i * 24, 479 - i * 4.4, 212 + i * 24, THIN)
			}
			ground(p)
		},
	},

	/** An eraser and its crumbs, for pages that don't exist. */
	eraser: {
		width: 200,
		height: 140,
		draw(p) {
			p.polygon([
				[40, 70],
				[130, 30],
				[160, 80],
				[70, 120],
			])
			p.line(85, 50, 115, 100)
			p.hatch(
				[
					[40, 70],
					[85, 50],
					[115, 100],
					[70, 120],
				],
				3.5,
			)
			for (let [x, y] of [
				[150, 118],
				[166, 110],
				[178, 124],
				[140, 128],
			] as const) {
				p.circle(x, y, 4, { ...THIN, double: false })
			}
		},
	},

	house: {
		width: 48,
		height: 48,
		draw(p) {
			p.lines([
				[4, 22],
				[24, 5],
				[44, 22],
			])
			p.box(9, 22, 30, 22, { over: 3 })
			p.rect(20, 30, 8, 14)
		},
	},

	window: {
		width: 48,
		height: 48,
		draw(p) {
			p.box(4, 8, 40, 32, { over: 4 })
			p.line(4, 16, 44, 16)
			p.line(10, 24, 30, 24, THIN)
			p.line(10, 31, 24, 31, THIN)
		},
	},

	question: {
		width: 48,
		height: 48,
		draw(p) {
			p.curve(
				[
					[15, 17],
					[20, 8],
					[31, 8],
					[34, 17],
					[26, 24],
					[24, 32],
				],
				{ roughness: 0.8 },
			)
			p.circle(24, 40, 3, { roughness: 0.5 })
		},
	},

	github: {
		width: 48,
		height: 48,
		draw(p) {
			p.circle(24, 24, 38, { roughness: 1 })
			p.curve(
				[
					[18, 40],
					[18, 32],
					[12, 29],
					[12, 20],
					[14, 13],
					[19, 16],
					[24, 15],
					[29, 16],
					[34, 13],
					[36, 20],
					[36, 29],
					[30, 32],
					[30, 40],
				],
				{ ...THIN, roughness: 0.6 },
			)
		},
	},

	books: {
		width: 48,
		height: 48,
		draw(p) {
			p.box(5, 34, 38, 10, { over: 3 })
			p.box(9, 24, 32, 10, { over: 3 })
			p.box(4, 14, 34, 10, { over: 3 })
			p.hatchRect(35, 34, 8, 10, 3)
		},
	},

	pencil: {
		width: 48,
		height: 48,
		draw(p) {
			p.polygon([
				[8, 34],
				[32, 8],
				[40, 16],
				[16, 42],
			])
			p.lines([
				[8, 34],
				[5, 45],
				[16, 42],
			])
			p.line(28, 12, 36, 20, THIN)
			p.hatch(
				[
					[8, 34],
					[32, 8],
					[34, 10],
					[10, 36],
				],
				2.5,
			)
		},
	},

	mail: {
		width: 48,
		height: 48,
		draw(p) {
			p.box(4, 12, 40, 28, { over: 4 })
			p.lines([
				[4, 12],
				[24, 28],
				[44, 12],
			])
		},
	},

	moon: {
		width: 26,
		height: 26,
		draw(p) {
			p.curve(
				[
					[17, 4],
					[9, 6],
					[6, 13],
					[9, 20],
					[17, 23],
					[22, 19],
					[15, 18],
					[12, 11],
					[17, 4],
				],
				{ roughness: 0.5 },
			)
		},
	},

	sun: {
		width: 26,
		height: 26,
		draw(p) {
			p.circle(13, 13, 10, { roughness: 0.5 })
			for (let i = 0; i < 8; i++) {
				let a = (i / 8) * Math.PI * 2
				let c = Math.cos(a)
				let s = Math.sin(a)
				p.line(13 + c * 8, 13 + s * 8, 13 + c * 11.5, 13 + s * 11.5, {
					roughness: 0.4,
					double: false,
				})
			}
		},
	},

	chevronLeft: {
		width: 34,
		height: 44,
		draw(p) {
			p.lines(
				[
					[26, 6],
					[8, 22],
					[26, 38],
				],
				{ width: 1.8, roughness: 1.2 },
			)
		},
	},

	chevronRight: {
		width: 34,
		height: 44,
		draw(p) {
			p.lines(
				[
					[8, 6],
					[26, 22],
					[8, 38],
				],
				{ width: 1.8, roughness: 1.2 },
			)
		},
	},

	bullet: {
		width: 14,
		height: 14,
		draw(p) {
			p.circle(7, 7, 6, { width: 1.2, roughness: 0.3, double: false })
		},
	},

	triangle: {
		width: 12,
		height: 12,
		draw(p) {
			p.polygon(
				[
					[3, 2],
					[10, 6],
					[3, 10],
				],
				{ width: 1.1, roughness: 0.4, double: false },
			)
		},
	},
} satisfies Record<string, DoodleDef>

export type DoodleName = keyof typeof doodles

function seedOf(name: string) {
	let seed = 7
	for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) >>> 0
	return seed
}

export function drawDoodle(name: DoodleName) {
	let def: DoodleDef = doodles[name]
	let pencil = new Pencil(seedOf(name))
	def.draw(pencil)
	return { width: def.width, height: def.height, top: def.top ?? 0, strokes: pencil.strokes }
}
