import { createController } from 'remix/router'

import { getArticle, listArticles } from '../../content/articles.ts'
import { routes } from '../../routes.ts'
import { NotFoundPage } from '../not-found-page.tsx'
import { ArticlesIndexPage } from './index-page.tsx'
import { ArticlePage } from './show-page.tsx'

const pageCache = { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' }

export default createController(routes.articles, {
	actions: {
		async index(context) {
			let articles = await listArticles()
			return context.render(<ArticlesIndexPage articles={articles} />, { headers: pageCache })
		},
		async show(context) {
			let article = await getArticle(context.params.slug)
			if (!article) {
				return context.render(<NotFoundPage pathname={context.url.pathname} />, { status: 404 })
			}
			let articles = await listArticles()
			let index = articles.findIndex((entry) => entry.slug === article.slug)
			return context.render(
				<ArticlePage article={article} newer={articles[index - 1]} older={articles[index + 1]} />,
				{ headers: pageCache },
			)
		},
	},
})
