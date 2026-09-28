import { get, post, route } from 'remix/routes'

export const routes = route({
	assets: get('/assets/*path'),
	home: get('/'),
	about: get('/about'),
	/** Sets the theme cookie; the toggle's no-JavaScript path. */
	theme: post('/theme'),
	projects: {
		index: get('/projects'),
		show: get('/projects/:slug'),
	},
	articles: {
		index: get('/articles'),
		feed: get('/articles/feed.xml'),
		show: get('/articles/:slug'),
	},
	sitemap: get('/sitemap.xml'),
	robots: get('/robots.txt'),
	notFound: get('/*path'),
})
