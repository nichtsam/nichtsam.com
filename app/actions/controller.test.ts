import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { listArticles } from '../content/articles.ts'
import { router } from '../router.ts'
import { routes } from '../routes.ts'

function get(path: string) {
	return router.fetch(new URL(path, 'http://localhost'))
}

describe('site routes', () => {
	it('renders the home page with the sketchpad', async () => {
		let response = await get(routes.home.href())
		assert.equal(response.status, 200)
		assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)
		let html = await response.text()
		assert.match(html, /Samuel/)
		assert.match(html, /aria-label="Poke Sam"/)
	})

	it('lists published articles', async () => {
		let articles = await listArticles()
		assert.ok(articles.length > 0)
		assert.ok(articles.every((article) => !article.draft))

		let response = await get(routes.articles.index.href())
		assert.equal(response.status, 200)
		let html = await response.text()
		for (let article of articles) {
			assert.ok(html.includes(routes.articles.show.href({ slug: article.slug })))
		}
	})

	it('renders an article with highlighted code', async () => {
		let [article] = await listArticles()
		let response = await get(routes.articles.show.href({ slug: article!.slug }))
		assert.equal(response.status, 200)
		let html = await response.text()
		assert.match(html, /class="code-block"/)
		assert.match(html, /class="shiki/)
	})

	it('returns 404 for unknown articles and pages', async () => {
		assert.equal((await get(routes.articles.show.href({ slug: 'does-not-exist' }))).status, 404)
		let response = await get('/definitely/not/here')
		assert.equal(response.status, 404)
		assert.match(await response.text(), /Oops, crumpled/)
	})

	it('serves sitemap.xml and robots.txt', async () => {
		let sitemap = await get(routes.sitemap.href())
		assert.equal(sitemap.status, 200)
		assert.match(await sitemap.text(), /<urlset/)

		let robots = await get(routes.robots.href())
		assert.equal(robots.status, 200)
		assert.match(await robots.text(), /Sitemap: /)
	})
})
