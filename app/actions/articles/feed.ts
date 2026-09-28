import { html } from 'remix/html-template'

import type { ArticleMeta } from '../../content/articles.ts'
import { absoluteUrl, site } from '../../content/site.ts'
import { routes } from '../../routes.ts'

/** An RSS 2.0 feed of published articles. */
export function renderFeed(articles: ArticleMeta[]) {
	let items = articles.map((article) => {
		let url = absoluteUrl(routes.articles.show.href({ slug: article.slug }))
		let date = new Date(`${article.publishedDate}T00:00:00Z`).toUTCString()
		return html`
    <item>
      <title>${article.title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${article.description}</description>
    </item>`
	})
	return html`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${site.name} · articles</title>
    <link>${absoluteUrl(routes.articles.index.href())}</link>
    <atom:link href="${absoluteUrl(routes.articles.feed.href())}" rel="self" type="application/rss+xml" />
    <description>${site.description}</description>
    <language>en</language>${items}
  </channel>
</rss>
`
}
