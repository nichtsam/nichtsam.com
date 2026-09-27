import { get, route } from 'remix/routes'

export const routes = route({
	assets: get('/assets/*path'),
	home: get('/'),
	articles: {
		index: get('/articles'),
		show: get('/articles/:slug'),
	},
	sitemap: get('/sitemap.xml'),
	robots: get('/robots.txt'),
	notFound: get('/*path'),
})
