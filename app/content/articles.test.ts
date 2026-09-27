import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { formatDate, slugify } from './articles.ts'

describe('articles helpers', () => {
	it('slugifies headings', () => {
		assert.equal(slugify('Step 1: Full-Screen Height'), 'step-1-full-screen-height')
		assert.equal(slugify('<code>git</code> filter-repo'), 'git-filter-repo')
	})

	it('formats ISO dates', () => {
		assert.equal(formatDate('2025-03-30'), 'Mar 2025')
		assert.equal(formatDate('not a date'), 'not a date')
	})
})
