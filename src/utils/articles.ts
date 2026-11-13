import { type CollectionEntry, getCollection } from 'astro:content'
import readingTime from 'reading-time'

export type Article = CollectionEntry<'articles'>

export async function getArticles() {
	const articles = await getCollection('articles')

	return articles.sort(
		(a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
	)
}

export function articlePath(id: string) {
	return `/articles/${id}`
}

export function readingMinutes(article: Article) {
	return Math.ceil(readingTime(article.body ?? '').minutes)
}

// Frontmatter dates are parsed as UTC midnight, so the UTC day is the one written
export function formatPublishedDate(date: Date) {
	return date.toISOString().slice(0, 10)
}
