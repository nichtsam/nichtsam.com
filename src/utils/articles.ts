import { type CollectionEntry, getCollection } from 'astro:content'

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
