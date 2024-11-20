export const faviconLinks = [
	{
		rel: 'icon',
		href: '/favicons/favicon.svg',
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '32x32',
		href: '/favicons/favicon-32x32.png',
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16',
		href: '/favicons/favicon-16x16.png',
	},
	{
		rel: 'apple-touch-icon',
		sizes: '180x180',
		href: '/favicons/apple-touch-icon.png',
	},
	{
		rel: 'mask-icon',
		href: '/favicons/safari-pinned-tab.svg',
		color: '#000000',
	},
]

export const FaviconMeta = () => (
	<>
		<meta name="theme-color" content="#ffffff" />
		<meta name="msapplication-TileColor" content="#00aba9" />
		<meta name="msapplication-config" content="/favicons/browserconfig.xml" />
	</>
)
