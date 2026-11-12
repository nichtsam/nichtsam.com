import { type CollectionEntry, getCollection } from 'astro:content'
import readingTime from 'reading-time'

export type Article = CollectionEntry<'articles'>

export async function getPublishedArticles() {
	const articles = await getCollection('articles')

	return articles.sort(
		(a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
	)
}

export function articlePath(id: string) {
	return `/articles/${id}`
}

export function articleReadingTime(article: Article) {
	return readingTime(article.body ?? '').text
}

// Frontmatter dates are parsed as UTC midnight
const publishedDateFormat = new Intl.DateTimeFormat('en', {
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
})

export function formatPublishedDate(date: Date) {
	return publishedDateFormat.format(date)
}
