/**
 * @vitest-environment jsdom
 */

import { resolve } from 'path'
import { faker } from '@faker-js/faker'
import { type UIMatch } from 'react-router'
import { describe, expect, test } from 'vitest'
import { matchesToBreadcrumbs } from './breadcrumb.tsx'

describe('fn matchesToBreadcrumbs', () => {
	test('gather breadcrumb from matches', () => {
		const matches = createMatches()
		const breadcrumbCount = matches.filter(
			(match) =>
				match.handle &&
				typeof match.handle === 'object' &&
				'breadcrumb' in match.handle,
		).length

		const breadcrumbs = matchesToBreadcrumbs(matches)
		expect(breadcrumbCount).toEqual(breadcrumbs.length)
	})

	test('able to skip breadcrumbs', () => {
		const matches = createMatches({ min: 5, breadcrumb: 'all' })
		const skip = faker.number.int({ min: 1, max: 3 })

		const breadcrumbCount =
			matches.filter(
				(match) =>
					match.handle &&
					typeof match.handle === 'object' &&
					'breadcrumb' in match.handle,
			).length - skip

		const breadcrumbs = matchesToBreadcrumbs(matches, { skip })
		expect(breadcrumbCount).toEqual(breadcrumbs.length)
	})

	test('return empty array if not enough breadcrumbs', () => {
		const matches = createMatches({ max: 3 })
		expect(matchesToBreadcrumbs(matches, { skip: 4 })).toHaveLength(0)
		expect(matchesToBreadcrumbs(matches, { minBreadcrumbs: 4 })).toHaveLength(0)
		expect(
			matchesToBreadcrumbs(matches, { skip: 2, minBreadcrumbs: 2 }),
		).toHaveLength(0)
	})
})

function createMatches({
	min = 1,
	max = 10,
	breadcrumb = 'some',
}: {
	min?: number
	max?: number
	breadcrumb?: 'none' | 'all' | 'some'
} = {}): UIMatch[] {
	const matches: UIMatch[] = []

	const nestedLength = faker.number.int({ min, max })

	for (let index = 0; index < nestedLength; index += 1) {
		matches.push(
			createMatch({
				parentPath: matches[index - 1]?.pathname,
				breadcrumb:
					breadcrumb === 'all' ? 'yes' : breadcrumb === 'none' ? 'no' : 'maybe',
			}),
		)
	}

	return matches
}

function createMatch({
	parentPath,
	breadcrumb = 'maybe',
}: {
	parentPath?: string
	breadcrumb?: 'yes' | 'no' | 'maybe'
} = {}): UIMatch {
	return {
		id: faker.string.uuid(),
		pathname: parentPath ? resolve(parentPath, faker.lorem.word()) : '/',
		// ! what about repeated breadcrumb title?
		handle: faker.helpers.maybe(() => ({ breadcrumb: faker.lorem.word() }), {
			probability:
				breadcrumb === 'yes' ? 1 : breadcrumb === 'no' ? 0 : undefined,
		}),
		data: null,
		params: {},
	}
}
