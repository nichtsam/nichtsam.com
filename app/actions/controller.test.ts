import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { listArticles } from '../content/articles.ts'
import { listProjects } from '../content/projects.ts'
import { router } from '../router.ts'
import { routes } from '../routes.ts'

const origin = 'http://localhost'

function get(path: string, init?: RequestInit) {
	return router.fetch(new Request(new URL(path, origin), init))
}

function postTheme(fields: Record<string, string>, headers: Record<string, string> = {}) {
	let body = new FormData()
	for (let [name, value] of Object.entries(fields)) body.set(name, value)
	return router.fetch(
		new Request(new URL(routes.theme.href(), origin), {
			method: 'POST',
			body,
			headers: { 'Sec-Fetch-Site': 'same-origin', ...headers },
		}),
	)
}

describe('pages', () => {
	it('renders the home page with the hero, sections and SEO tags', async () => {
		let response = await get(routes.home.href())
		assert.equal(response.status, 200)
		assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)
		assert.match(response.headers.get('Vary') ?? '', /cookie/i)
		let html = await response.text()
		assert.match(html, /<h1[^>]*>/)
		assert.match(html, /aria-roledescription="carousel"/)
		assert.match(html, /<link rel="canonical" href="https:\/\/nichtsam\.com\/"/)
		assert.match(html, /"@type":"Person"/)
		assert.match(html, /data-sketch="sheet"/)
		assert.match(html, /href="#main"/)
	})

	it('renders the about page', async () => {
		let response = await get(routes.about.href())
		assert.equal(response.status, 200)
		let html = await response.text()
		assert.match(html, /About · nichtsam/)
		assert.match(html, /aria-current="page"/)
	})

	it('lists and shows projects', async () => {
		let [project] = listProjects()
		let index = await get(routes.projects.index.href())
		assert.equal(index.status, 200)
		assert.ok((await index.text()).includes(routes.projects.show.href({ slug: project!.slug })))

		let show = await get(routes.projects.show.href({ slug: project!.slug }))
		assert.equal(show.status, 200)
		assert.ok((await show.text()).includes(project!.title))

		assert.equal((await get(routes.projects.show.href({ slug: 'nope' }))).status, 404)
	})

	it('lists published articles', async () => {
		let articles = await listArticles()
		assert.ok(articles.length > 0)
		assert.ok(articles.every((article) => !article.draft))

		let html = await (await get(routes.articles.index.href())).text()
		for (let article of articles) {
			assert.ok(html.includes(routes.articles.show.href({ slug: article.slug })))
		}
	})

	it('renders an article with highlighted code and structured data', async () => {
		let [article] = await listArticles()
		let response = await get(routes.articles.show.href({ slug: article!.slug }))
		assert.equal(response.status, 200)
		let html = await response.text()
		assert.match(html, /class="code-block"/)
		assert.match(html, /class="shiki/)
		assert.match(html, /"@type":"BlogPosting"/)
		assert.match(html, /property="og:type" content="article"/)
	})

	it('returns a 404 page that search engines skip', async () => {
		assert.equal((await get(routes.articles.show.href({ slug: 'does-not-exist' }))).status, 404)
		let response = await get('/definitely/not/here')
		assert.equal(response.status, 404)
		let html = await response.text()
		assert.match(html, /Nothing drawn here yet/)
		assert.match(html, /name="robots" content="noindex"/)
	})
})

describe('theme', () => {
	it('renders the theme saved in the cookie', async () => {
		let html = await (await get(routes.home.href(), { headers: { Cookie: 'theme=dark' } })).text()
		assert.match(html, /<html lang="en" data-theme="dark"/)

		let system = await (await get(routes.home.href())).text()
		assert.doesNotMatch(system, /data-theme=/)
	})

	it('saves the theme and redirects back without JavaScript', async () => {
		let response = await postTheme({ theme: 'dark', returnTo: '/articles' })
		assert.equal(response.status, 303)
		assert.equal(response.headers.get('Location'), '/articles')
		assert.match(
			response.headers.get('Set-Cookie') ?? '',
			/^theme=dark; Path=\/; Max-Age=\d+; SameSite=Lax/,
		)
	})

	it('only redirects within the site', async () => {
		for (let returnTo of ['https://evil.example', '//evil.example', '/\\evil.example']) {
			let response = await postTheme({ theme: 'light', returnTo })
			assert.equal(response.headers.get('Location'), '/')
		}
	})

	it('rejects unknown themes and cross-site posts', async () => {
		assert.equal((await postTheme({ theme: 'purple' })).status, 400)
		let crossSite = await postTheme({ theme: 'dark' }, { 'Sec-Fetch-Site': 'cross-site' })
		assert.equal(crossSite.status, 403)
	})
})

describe('feeds', () => {
	it('serves sitemap.xml with every page', async () => {
		let response = await get(routes.sitemap.href())
		assert.equal(response.status, 200)
		let xml = await response.text()
		assert.match(xml, /<urlset/)
		for (let path of [
			routes.about.href(),
			routes.projects.index.href(),
			routes.articles.index.href(),
		]) {
			assert.ok(xml.includes(`https://nichtsam.com${path}</loc>`), path)
		}
	})

	it('serves robots.txt pointing at the sitemap', async () => {
		let text = await (await get(routes.robots.href())).text()
		assert.match(text, /Sitemap: https:\/\/nichtsam\.com\/sitemap\.xml/)
	})

	it('serves an RSS feed of articles', async () => {
		let response = await get(routes.articles.feed.href())
		assert.equal(response.status, 200)
		assert.match(response.headers.get('Content-Type') ?? '', /application\/rss\+xml/)
		let xml = await response.text()
		let articles = await listArticles()
		assert.equal(xml.match(/<item>/g)?.length, articles.length)
	})
})
