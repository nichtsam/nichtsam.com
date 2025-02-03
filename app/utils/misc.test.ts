import { faker } from '@faker-js/faker'
import {
	describe,
	expect,
	test,
	vi,
	type Assertion,
	type ExpectStatic,
} from 'vitest'
import { generateCallAll } from './misc.ts'

describe('fn generateCallAll', () => {
	test('generates a function that calls everyone', () => {
		const fns = new Array(faker.number.int({ min: 1, max: 10 }))
			.fill(0)
			.map(() => vi.fn())

		generateCallAll(...fns)()

		expectArray(fns, (expected) => expected.toHaveBeenCalledOnce())
	})

	test('everyone receives args', () => {
		const fns = new Array(faker.number.int({ min: 1, max: 10 }))
			.fill(0)
			.map(() => vi.fn())

		const arg = [
			faker.lorem.slug(),
			faker.number.int(),
			faker.datatype.boolean(),
		]

		generateCallAll(...fns)(...arg)

		expectArray(fns, (expected) => expected.toHaveBeenCalledWith(...arg))
	})
})

const expectArray = (
	actuals: Array<Parameters<ExpectStatic>[0]>,
	assert: (expected: Assertion) => void,
	message?: Parameters<ExpectStatic>[1],
) => {
	for (let idx = 0; idx < actuals.length; idx += 1) {
		const actual = actuals[idx]!
		assert(
			expect(actual, `the ${idx + 1} time${message ? ` - ${message}` : ''}`),
		)
	}
}
