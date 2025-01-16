/**
 * @vitest-environment jsdom
 */

import { resolve } from 'path'
import { faker } from '@faker-js/faker'
import { render, screen } from '@testing-library/react'
import { useMatches, type UIMatch } from 'react-router'
import { describe, expect, test, vi } from 'vitest'
import { useBreadcrumbs } from './breadcrumb.tsx'

vi.mock('react-router', () => {
	return {
		useMatches: vi.fn(),
		Link: 'a',
	}
})

function TestComponent(options?: { skip?: number; minBreadcrumbs?: number }) {
	const breadcrumbs = useBreadcrumbs(options)

	if (!breadcrumbs) {
		return null
	}

	return (
		<ul>
			{breadcrumbs.map((breadcrumb) => (
				<li data-testid={breadcrumb.id} key={breadcrumb.id}>
					{breadcrumb.element}
				</li>
			))}
		</ul>
	)
}

describe('fn useBreadcrumbs', () => {
	test('gather breadcrumb from matches', () => {
		const matches = createMatches()
		const breadcrumbsInfo = extractBreadcrumbsInfo(matches)
		vi.mocked(useMatches).mockImplementation(() => matches)
		render(<TestComponent />)

		breadcrumbsInfo.forEach(({ id, breadcrumb }) => {
			const breadcrumbListItem = screen.getByTestId(id)
			expect(breadcrumbListItem).toBeInTheDocument()
			expect(breadcrumbListItem).toHaveTextContent(breadcrumb)
		})
	})

	test('return null if matches have no breadcrumb', () => {
		const matches = createMatches({ breadcrumb: 'none' })
		vi.mocked(useMatches).mockImplementation(() => matches)

		const { container } = render(<TestComponent />)
		expect(container).toBeEmptyDOMElement()
	})

	test('breadcrumbs are linked, except the last one', () => {
		const matches = createMatches({ min: 1, breadcrumb: 'all' })
		const breadcrumbsInfo = extractBreadcrumbsInfo(matches)
		vi.mocked(useMatches).mockImplementation(() => matches)
		render(<TestComponent />)

		breadcrumbsInfo.forEach(({ id, breadcrumb, pathname }, index) => {
			const isLast = index === breadcrumbsInfo.length - 1
			const breadcrumbListItem = screen.getByTestId(id)
			expect(breadcrumbListItem).toBeInTheDocument()
			expect(breadcrumbListItem).toHaveTextContent(breadcrumb)

			if (isLast) {
				expect(breadcrumbListItem.firstElementChild).not.toBe('A')
			} else {
				const breadcrumbLink = breadcrumbListItem.firstElementChild

				if (!breadcrumbLink) {
					expect(breadcrumbLink).toBeTruthy()
					throw new Error('expect(breadcrumbLink).toBeTruthy();') // as type guard
				}

				expect(breadcrumbLink.tagName).toBe('A')
				expect(breadcrumbLink).toHaveAttribute('to', pathname)
			}
		})
	})

	test('able to skip breadcrumbs', () => {
		const matches = createMatches({ min: 5 }) // let's have something to skip.
		const breadcrumbsInfo = extractBreadcrumbsInfo(matches)
		vi.mocked(useMatches).mockImplementation(() => matches)

		// at least skip one for proper testing, but don't skip everything, that's another test case.
		const skip = faker.number.int({ min: 1, max: 3 })
		render(<TestComponent skip={skip} />)

		breadcrumbsInfo.forEach(({ id, breadcrumb }, index) => {
			const isSkip = index < skip
			const breadcrumbListItem = screen.queryByTestId(id)
			if (isSkip) {
				expect(breadcrumbListItem).not.toBeInTheDocument()
			} else {
				expect(breadcrumbListItem).toBeInTheDocument()
				expect(breadcrumbListItem).toHaveTextContent(breadcrumb)
			}
		})
	})

	test('return null if every breadcrumb is skipped', () => {
		const matches = createMatches({ max: 5 }) // let's have something to skip.
		vi.mocked(useMatches).mockImplementation(() => matches)

		const skip = faker.number.int({ min: 5, max: 10 })
		const { container } = render(<TestComponent skip={skip} />)
		expect(container).toBeEmptyDOMElement()
	})

	test('return breadcrumbs if more breadcrumbs than minBreadcrumbs', () => {
		const matches = createMatches({ min: 4, max: 10, breadcrumb: 'all' })
		const breadcrumbsInfo = extractBreadcrumbsInfo(matches)
		vi.mocked(useMatches).mockImplementation(() => matches)

		const minBreadcrumbs = faker.number.int({ min: 1, max: 3 })
		render(<TestComponent minBreadcrumbs={minBreadcrumbs} />)

		breadcrumbsInfo.forEach(({ id, breadcrumb }) => {
			const breadcrumbListItem = screen.getByTestId(id)
			expect(breadcrumbListItem).toBeInTheDocument()
			expect(breadcrumbListItem).toHaveTextContent(breadcrumb)
		})
	})

	test('return null if less breadcrumbs than minBreadcrumbs', () => {
		const matches = createMatches({ min: 1, max: 3 })
		vi.mocked(useMatches).mockImplementation(() => matches)

		const minBreadcrumbs = faker.number.int({ min: 4, max: 10 })
		const { container } = render(
			<TestComponent minBreadcrumbs={minBreadcrumbs} />,
		)
		expect(container).toBeEmptyDOMElement()
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

function extractBreadcrumbsInfo(matches: UIMatch[]) {
	return matches
		.map(({ id, pathname, handle }) =>
			typeof handle === 'object' &&
			handle &&
			'breadcrumb' in handle &&
			typeof handle.breadcrumb === 'string'
				? { id, pathname, breadcrumb: handle.breadcrumb }
				: false,
		)
		.filter((v): v is { id: string; pathname: string; breadcrumb: string } => {
			if (typeof v !== 'boolean') {
				return true
			}
			return false
		})
}
