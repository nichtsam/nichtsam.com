import { allArticles } from '#content-collections'

export const publishedArticles = allArticles.filter((article) => !article.draft)

export function articlePath(slug: string) {
	return `/articles/${slug}`
}
