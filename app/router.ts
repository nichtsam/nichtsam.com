import { compression } from 'remix/middleware/compression'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import articlesController from './actions/articles/controller.tsx'
import controller from './actions/controller.tsx'
import { assets } from './assets.ts'
import { routes } from './routes.ts'

const isProduction = process.env.NODE_ENV === 'production'
const renderMiddleware = render({ assets })
type AppContext = MiddlewareContext<[typeof renderMiddleware]>

declare module 'remix/router' {
	interface RouterTypes {
		context: AppContext
	}
}

export const router = createRouter<AppContext>({
	middleware: [
		compression(),
		staticFiles('./public', {
			index: false,
			cacheControl: isProduction ? 'public, max-age=3600' : 'no-cache',
		}),
		renderMiddleware,
	],
})

router.map(routes.articles, articlesController)
router.map(routes, controller)
