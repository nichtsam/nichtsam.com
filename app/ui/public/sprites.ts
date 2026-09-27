import { flip, fromRows, paint, type Sprite } from './pixel.tsx'

export const C = {
	ink: '#22203a',
	white: '#fffaf0',
	skin: '#f7c59f',
	skinShade: '#e0996c',
	hair: '#4a2f25',
	hairLight: '#7a4b35',
	shirt: '#ff4f6d',
	shirtShade: '#c93656',
	pants: '#2e4a8f',
	pantsShade: '#213468',
	shoe: '#3b2a2a',
	green: '#2fb36b',
	greenDark: '#1f7a4a',
	greenLight: '#7fdc8a',
	gold: '#ffbe2e',
	goldDark: '#d98e1a',
	wood: '#8a5a3b',
	woodDark: '#5e3a26',
	woodLight: '#c08457',
	sky: '#8fd3ff',
	skyDark: '#4aa3e8',
	night: '#1f2a5a',
	nightDeep: '#141c40',
	metal: '#9aa0b5',
	metalDark: '#5f6478',
	purple: '#b98bff',
	purpleDark: '#7b55c9',
	screen: '#1a1830',
	terminal: '#7cf2a8',
	fur: '#ff9f43',
	furDark: '#d9731f',
	pink: '#ff8fab',
	blue: '#2e8ff0',
	cream: '#f6efdc',
	clay: '#d0684a',
	clayDark: '#9c4630',
} as const

// ─── Sam ─────────────────────────────────────────────────────────────────

const samPalette = {
	k: C.ink,
	w: C.white,
	s: C.skin,
	S: C.skinShade,
	h: C.hair,
	H: C.hairLight,
	r: C.shirt,
	R: C.shirtShade,
	b: C.pants,
	B: C.pantsShade,
	n: C.shoe,
}

const samTop = [
	'................',
	'....kkkkkkkk....',
	'...khhhhhhhhk...',
	'..khhHHhhhhhhk..',
	'..khHhhhhhhhhk..',
	'..khhsshhsshhk..',
	'..khsssssssshk..',
	'..kssksssskssk..',
	'..kssksssskssk..',
	'..kSssssssssSk..',
	'...kssskksssk...',
	'....kkkkkkkk....',
	'......kssk......',
	'...kkrrrrrrkk...',
	'..krrrrwwrrrrk..',
	'..kRrrrrrrrrRk..',
	'..ksRrrrrrrRsk..',
]

export const samIdle = fromRows(
	[...samTop, '...kbbbbbbbbk...', '...kbbBkkBbbk...', '...knnnkknnnk...'],
	samPalette,
)

export const samStep = fromRows(
	[...samTop, '...kbbbbbbbbk...', '..kbbBk..kBbbk..', '..knnk....knnk..'],
	samPalette,
)

// Side view, facing right.
const samSideTop = [
	'................',
	'....kkkkkkkk....',
	'...khhhhhhhhk...',
	'..khhHHhhhhhhk..',
	'..khhhhhhhhhhk..',
	'..khhhhhhsshhk..',
	'..khhhhsssssk...',
	'..khhhssssksk...',
	'..khhhssssksk...',
	'...khhsssssssk..',
	'...khssssskkk...',
	'....kkkkkkk.....',
	'......kssk......',
	'.....krrrrk.....',
	'....krrrrrrk....',
	'....krRRrrrk....',
	'....krsSrrrk....',
]

export const samSideIdle = fromRows(
	[...samSideTop, '.....kbbbbk.....', '.....kbBbbk.....', '.....knnnnnk....'],
	samPalette,
)

export const samSideStep = fromRows(
	[...samSideTop, '.....kbbbbk.....', '....kbBkkbbk....', '...knnk..knnnk..'],
	samPalette,
)

export const samSideIdleLeft = flip(samSideIdle)
export const samSideStepLeft = flip(samSideStep)

// Back view, walking up.
const samBackTop = [
	'................',
	'....kkkkkkkk....',
	'...khhhhhhhhk...',
	'..khhHHhhhhhhk..',
	'..khHhhhhhhhhk..',
	'..khhhhhhhhhhk..',
	'..khhhhhhhhhhk..',
	'..khhhhhhhhhhk..',
	'..kshhhhhhhhsk..',
	'..kShhhhhhhhSk..',
	'...khhhhhhhhk...',
	'....kkkkkkkk....',
	'......kssk......',
	'...kkrrrrrrkk...',
	'..krrrrrrrrrrk..',
	'..kRrrrrrrrrRk..',
	'..ksRrrrrrrRsk..',
]

export const samBackIdle = fromRows(
	[...samBackTop, '...kbbbbbbbbk...', '...kbbBkkBbbk...', '...knnnkknnnk...'],
	samPalette,
)

export const samBackStep = fromRows(
	[...samBackTop, '...kbbbbbbbbk...', '..kbbBk..kBbbk..', '..knnk....knnk..'],
	samPalette,
)

// A tiny head used as the logo mark.
export const samHead = fromRows(samTop.slice(1, 12), samPalette)

// ─── Furniture ───────────────────────────────────────────────────────────

function outlineBox(
	fill: (x: number, y: number, w: number, h: number, c: string) => void,
	x: number,
	y: number,
	w: number,
	h: number,
	inner: string,
) {
	fill(x, y, w, h, C.ink)
	fill(x + 1, y + 1, w - 2, h - 2, inner)
}

function windowSprite(mode: 'day' | 'night') {
	return paint(48, 34, (fill) => {
		// frame
		outlineBox(fill, 0, 0, 48, 30, C.wood)
		fill(1, 1, 46, 1, C.woodLight)
		// glass
		let sky = mode === 'day' ? C.sky : C.night
		fill(3, 3, 42, 25, sky)
		if (mode === 'day') {
			fill(3, 20, 42, 8, '#b4e3ff')
			// sun
			fill(9, 6, 6, 8, C.gold)
			fill(8, 7, 8, 6, C.gold)
			fill(10, 7, 3, 2, '#fff3b0')
			// cloud
			fill(28, 10, 10, 3, C.white)
			fill(30, 8, 5, 2, C.white)
			fill(26, 12, 14, 2, C.white)
			fill(18, 18, 6, 2, C.white)
			fill(17, 19, 9, 1, C.white)
			// hills
			fill(3, 24, 42, 4, C.green)
			fill(8, 22, 10, 2, C.green)
			fill(30, 23, 12, 1, C.green)
		} else {
			fill(3, 20, 42, 8, C.nightDeep)
			// moon
			fill(33, 5, 6, 8, '#fff3b0')
			fill(32, 6, 8, 6, '#fff3b0')
			fill(35, 5, 5, 6, C.night)
			fill(36, 11, 3, 1, C.night)
			// stars
			for (let [sx, sy] of [
				[7, 6],
				[14, 10],
				[22, 5],
				[26, 13],
				[10, 16],
				[41, 17],
				[18, 18],
			] as const) {
				fill(sx, sy, 1, 1, C.white)
			}
			fill(12, 5, 1, 3, C.gold)
			fill(11, 6, 3, 1, C.gold)
			// hills
			fill(3, 24, 42, 4, C.greenDark)
			fill(8, 22, 10, 2, C.greenDark)
			// lit window far away
			fill(38, 25, 2, 2, C.gold)
		}
		// mullions
		fill(23, 3, 2, 25, C.wood)
		fill(3, 14, 42, 2, C.wood)
		fill(23, 3, 1, 25, C.woodLight)
		// sill
		fill(0, 29, 48, 5, C.ink)
		fill(1, 30, 46, 3, C.woodLight)
		fill(1, 32, 46, 1, C.wood)
	})
}

export const windowDay = windowSprite('day')
export const windowNight = windowSprite('night')

export const door = paint(32, 48, (fill) => {
	outlineBox(fill, 0, 0, 32, 48, C.woodDark)
	fill(3, 3, 26, 45, C.wood)
	// panels
	outlineBox(fill, 6, 6, 20, 14, C.woodLight)
	fill(8, 8, 16, 10, C.wood)
	outlineBox(fill, 6, 24, 20, 20, C.woodLight)
	fill(8, 26, 16, 16, C.wood)
	// handle
	fill(23, 26, 4, 4, C.ink)
	fill(24, 27, 2, 2, C.gold)
	// sign
	outlineBox(fill, 9, 9, 14, 7, C.white)
	fill(11, 11, 10, 1, C.blue)
	fill(11, 13, 7, 1, C.blue)
})

export const poster = paint(24, 30, (fill) => {
	outlineBox(fill, 0, 0, 24, 30, C.cream)
	fill(2, 2, 20, 17, C.purple)
	fill(2, 10, 20, 9, C.pink)
	fill(8, 5, 6, 6, C.gold)
	fill(2, 14, 20, 5, C.purpleDark)
	fill(6, 12, 6, 2, C.purpleDark)
	fill(14, 11, 5, 3, C.purpleDark)
	// caption
	fill(4, 21, 16, 2, C.ink)
	fill(6, 25, 12, 1, C.metalDark)
	fill(7, 27, 10, 1, C.metalDark)
	// pins
	fill(1, 1, 2, 2, C.shirt)
	fill(21, 1, 2, 2, C.shirt)
})

const bookColors = [C.shirt, C.blue, C.gold, C.green, C.purple, C.fur, C.pink, C.skyDark]

export const bookshelf = paint(32, 48, (fill) => {
	outlineBox(fill, 0, 0, 32, 48, C.woodDark)
	fill(2, 2, 28, 44, C.wood)
	let shelves = [4, 18, 32]
	shelves.forEach((top, row) => {
		fill(3, top, 26, 11, C.woodDark)
		let x = 4
		let i = row * 3
		while (x < 27) {
			let width = 2 + ((i * 7) % 3)
			let height = 7 + ((i * 5) % 4)
			let color = bookColors[i % bookColors.length]!
			if (x + width > 28) break
			fill(x, top + 11 - height, width, height, C.ink)
			fill(x, top + 11 - height, width - 1, height, color)
			fill(x, top + 12 - height, width - 1, 1, C.white)
			x += width + (i % 4 === 3 ? 2 : 0)
			i++
		}
		fill(2, top + 11, 28, 2, C.woodLight)
		fill(2, top + 13, 28, 1, C.ink)
	})
	fill(2, 46, 28, 2, C.ink)
})

export const desk = paint(48, 34, (fill) => {
	// monitor
	outlineBox(fill, 10, 0, 26, 18, C.metal)
	fill(12, 2, 22, 13, C.screen)
	fill(14, 4, 6, 1, C.terminal)
	fill(14, 6, 12, 1, C.terminal)
	fill(16, 8, 9, 1, C.terminal)
	fill(16, 10, 14, 1, C.gold)
	fill(14, 12, 2, 1, C.terminal)
	fill(17, 12, 1, 1, C.white)
	fill(20, 18, 6, 2, C.metalDark)
	fill(16, 19, 14, 1, C.ink)
	// mug
	fill(40, 13, 5, 6, C.ink)
	fill(41, 14, 3, 5, C.shirt)
	fill(44, 15, 2, 2, C.ink)
	// keyboard
	fill(6, 18, 10, 2, C.ink)
	fill(7, 18, 8, 1, C.metal)
	// desktop
	fill(0, 20, 48, 4, C.ink)
	fill(1, 20, 46, 3, C.woodLight)
	// legs + drawer
	fill(2, 24, 4, 10, C.ink)
	fill(3, 24, 2, 10, C.wood)
	fill(30, 24, 16, 10, C.ink)
	fill(31, 24, 14, 9, C.wood)
	fill(31, 28, 14, 1, C.woodDark)
	fill(36, 26, 4, 1, C.gold)
	fill(36, 30, 4, 1, C.gold)
})

function plantSprite(stage: number) {
	return paint(16, 32, (fill) => {
		// pot
		fill(3, 22, 10, 10, C.ink)
		fill(4, 22, 8, 9, C.clay)
		fill(2, 21, 12, 3, C.ink)
		fill(3, 21, 10, 2, C.clay)
		fill(4, 25, 2, 5, C.clayDark)
		// stem
		let top = 18 - stage * 4
		fill(7, top, 2, 22 - top, C.greenDark)
		// leaves
		let leaves: Array<[number, number, boolean]> = [
			[3, 17, false],
			[9, 15, true],
		]
		if (stage >= 1) leaves.push([2, 12, false], [9, 11, true])
		if (stage >= 2) leaves.push([3, 8, false], [9, 6, true])
		if (stage >= 3) leaves.push([4, 3, false], [8, 2, true])
		for (let [lx, ly, right] of leaves) {
			fill(lx, ly, 5, 3, C.ink)
			fill(lx + (right ? 0 : 1), ly + 1, 4, 1, C.green)
			fill(lx + (right ? 1 : 0), ly, 3, 1, C.greenLight)
		}
		if (stage >= 3) {
			fill(6, 0, 4, 3, C.pink)
			fill(7, 1, 2, 1, C.gold)
		}
	})
}

export const plants = [plantSprite(0), plantSprite(1), plantSprite(2), plantSprite(3)]

const catPalette = { k: C.ink, f: C.fur, F: C.furDark, w: C.white, p: C.pink }

export const catA = fromRows(
	[
		'................',
		'................',
		'..k...k.........',
		'.kfk.kfk........',
		'.kffkffk........',
		'.kfffffk........',
		'.kfkffkfk.......',
		'.kffpfffk.......',
		'..kffffk........',
		'..kfffffkk......',
		'.kfwwffffFk..kk.',
		'.kfwwfffffFk.kfk',
		'.kfffffFffFk.kfk',
		'.kfkffkfFFFkkfk.',
		'.kfkffkffFFffk..',
		'..kk.kkkkkkkk...',
	],
	catPalette,
)

export const catB = fromRows(
	[
		'................',
		'................',
		'..k...k.........',
		'.kfk.kfk........',
		'.kffkffk........',
		'.kfffffk........',
		'.kkkffkkk.......',
		'.kffpfffk.......',
		'..kffffk........',
		'..kfffffkk...kk.',
		'.kfwwffffFk.kfk.',
		'.kfwwfffffFk.kfk',
		'.kfffffFffFk.kfk',
		'.kfkffkfFFFkkfk.',
		'.kfkffkffFFffk..',
		'..kk.kkkkkkkk...',
	],
	catPalette,
)

export const boombox = paint(16, 14, (fill) => {
	fill(3, 0, 10, 3, C.ink)
	fill(4, 1, 8, 1, C.metal)
	fill(0, 3, 16, 11, C.ink)
	fill(1, 4, 14, 9, C.purple)
	fill(1, 4, 14, 1, C.pink)
	// speakers
	for (let sx of [2, 10]) {
		fill(sx, 6, 4, 5, C.ink)
		fill(sx + 1, 7, 2, 3, C.metalDark)
	}
	fill(7, 6, 2, 2, C.gold)
	fill(7, 9, 2, 1, C.white)
})

export const rug = paint(64, 30, (fill) => {
	fill(2, 0, 60, 30, C.ink)
	fill(0, 2, 64, 26, C.ink)
	fill(2, 2, 60, 26, C.purpleDark)
	fill(5, 5, 54, 20, C.purple)
	fill(8, 8, 48, 14, C.purpleDark)
	fill(11, 11, 42, 8, C.gold)
	fill(14, 13, 36, 4, C.purpleDark)
})

export const heart = fromRows(['.kk.kk.', 'kppkppk', 'kpppppk', '.kpppk.', '..kpk..', '...k...'], {
	k: C.ink,
	p: C.shirt,
})

export const note = fromRows(
	['...kkk', '...kgk', '...k..', '...k..', '.kkk..', 'kggk..', 'kkk...'],
	{ k: C.ink, g: C.gold },
)

export const sparkle = fromRows(['..k..', '..y..', 'kyyyk', '..y..', '..k..'], {
	k: C.ink,
	y: C.gold,
})

// ─── Icons ───────────────────────────────────────────────────────────────

const iconPalette = { k: 'currentColor' }

export const icons: Record<string, Sprite> = {
	github: fromRows(
		[
			'....kkkkkk....',
			'..kkkkkkkkkk..',
			'.kk.kkkkkk.kk.',
			'.kk........kk.',
			'kkk........kkk',
			'kk..........kk',
			'kk..........kk',
			'kk..........kk',
			'kkk........kkk',
			'.kkk......kkk.',
			'.k.kkk..kkkkk.',
			'..k.kk..kkkk..',
			'....kk..kk....',
			'....kk..kk....',
		],
		iconPalette,
	),
	linkedin: fromRows(
		[
			'kkkkkkkkkkkkkk',
			'k............k',
			'k.kk.........k',
			'k.kk.........k',
			'k............k',
			'k.kk.kkkkkk..k',
			'k.kk.kkk..kk.k',
			'k.kk.kk...kk.k',
			'k.kk.kk...kk.k',
			'k.kk.kk...kk.k',
			'k.kk.kk...kk.k',
			'k.kk.kk...kk.k',
			'k............k',
			'kkkkkkkkkkkkkk',
		],
		iconPalette,
	),
	sun: fromRows(
		[
			'......k.......',
			'..k...k...k...',
			'...k.....k....',
			'.....kkk......',
			'....kkkkk.....',
			'kk.kkkkkkk.kk.',
			'....kkkkk.....',
			'.....kkk......',
			'...k.....k....',
			'..k...k...k...',
			'......k.......',
		],
		iconPalette,
	),
	moon: fromRows(
		[
			'....kkkk.....',
			'..kkkk.......',
			'.kkkk........',
			'.kkk.........',
			'kkkk.........',
			'kkkk.........',
			'kkkkk......k.',
			'.kkkkk....kk.',
			'.kkkkkkkkkkk.',
			'..kkkkkkkkk..',
			'....kkkkk....',
		],
		iconPalette,
	),
	arrowLeft: fromRows(
		['...k....', '..kk....', '.kkkkkkk', 'kkkkkkkk', '.kkkkkkk', '..kk....', '...k....'],
		iconPalette,
	),
	clock: fromRows(
		[
			'..kkkkk..',
			'.k.....k.',
			'k...k...k',
			'k...k...k',
			'k...kkk.k',
			'k.......k',
			'k.......k',
			'.k.....k.',
			'..kkkkk..',
		],
		iconPalette,
	),
	rss: fromRows(
		[
			'kkkk.....',
			'....kk...',
			'kkk...k..',
			'...kk..k.',
			'.....k..k',
			'kk....k.k',
			'kkk...k.k',
			'kkk...k.k',
		],
		iconPalette,
	),
}

export type IconName = keyof typeof icons
