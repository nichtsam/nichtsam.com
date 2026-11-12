/** @type {import("prettier").Config} */
export default {
	semi: false,
	singleQuote: true,
	useTabs: true,
	proseWrap: 'always',
	// The Tailwind plugin has to come last to sort classes in `.astro` files
	plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
	// Tailwind v4 reads the theme from the stylesheet. The plugin is pinned to an
	// insiders build until a stable release supports prettier-plugin-astro v1
	tailwindStylesheet: './src/styles/app.css',
	overrides: [
		// Package managers rewrite package.json with spaces
		{ files: ['**/package.json'], options: { useTabs: false } },
	],
}
