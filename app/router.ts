import { asyncContext } from 'remix/middleware/async-context'
import { compression } from 'remix/middleware/compression'
import { cop } from 'remix/middleware/cop'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'

import articlesController from './actions/articles/controller.tsx'
import controller from './actions/controller.tsx'
import projectsController from './actions/projects/controller.tsx'
import { assets } from './assets.ts'
import { theme } from './middleware/theme.ts'
import { routes } from './routes.ts'

const isProduction = process.env.NODE_ENV === 'production'

const themeMiddleware = theme()
const renderMiddleware = render({ assets })
type AppContext = MiddlewareContext<[typeof themeMiddleware, typeof renderMiddleware]>

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
		cop(),
		asyncContext(),
		themeMiddleware,
		renderMiddleware,
	],
})

router.map(routes.projects, projectsController)
router.map(routes.articles, articlesController)
router.map(routes, controller)
