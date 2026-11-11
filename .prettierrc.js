import defaultConfig from '@epic-web/config/prettier'

/** @type {import("prettier").Options} */
export default {
	...defaultConfig,
	// The Tailwind plugin has to come last to sort classes in `.astro` files
	plugins: ['prettier-plugin-astro', ...defaultConfig.plugins],
}
