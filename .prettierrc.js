/** @type {import("prettier").Config} */
export default {
	semi: false,
	singleQuote: true,
	useTabs: true,
	proseWrap: 'always',
	// The Tailwind plugin has to come last to sort classes in `.astro` files
	plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
	overrides: [
		// Package managers rewrite package.json with spaces
		{ files: ['**/package.json'], options: { useTabs: false } },
		{
			files: ['**/*.mdx'],
			// Otherwise a component at the end of a line wraps on one save and
			// gains a blank line on the next
			options: { proseWrap: 'preserve', htmlWhitespaceSensitivity: 'ignore' },
		},
	],
}
