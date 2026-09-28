import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { drawDoodle, doodles, type DoodleName } from './doodles.ts'
import { drawShape, Pencil, shapes, type ShapeName } from './pencil.ts'

describe('pencil', () => {
	it('draws the same lines for the same seed', () => {
		assert.deepEqual(drawShape('frame', 5, 800, 400), drawShape('frame', 5, 800, 400))
		assert.notDeepEqual(drawShape('frame', 5, 800, 400), drawShape('frame', 6, 800, 400))
	})

	it('draws every shape at any size', () => {
		for (let name of Object.keys(shapes) as ShapeName[]) {
			for (let [w, h] of [
				[320, 12],
				[1400, 3000],
			] as const) {
				let strokes = drawShape(name, 1, w, h)
				assert.ok(strokes.length > 0, name)
				assert.ok(
					strokes.every((stroke) => /^M[-\d.]/.test(stroke.d) && !stroke.d.includes('NaN')),
					name,
				)
			}
		}
	})

	it('draws every doodle', () => {
		for (let name of Object.keys(doodles) as DoodleName[]) {
			let { strokes } = drawDoodle(name)
			assert.ok(strokes.length > 0, name)
			assert.ok(
				strokes.every((stroke) => !stroke.d.includes('NaN')),
				name,
			)
		}
	})

	it('shades a polygon with parallel strokes inside it', () => {
		let pencil = new Pencil(1).hatchRect(0, 0, 100, 40, 5)
		assert.ok(pencil.strokes.length > 5)
		assert.ok(pencil.strokes.every((stroke) => stroke.hatch))
	})
})
