import { Icon } from '#app/components/ui/icon.tsx'
import { type NavLink } from '#app/model/nav.ts'

export const coreNav = [
	{
		title: 'About Me',
		href: '/about',
	},
	{
		title: 'Reach Out',
		href: '/contact',
	},
	{
		title: 'My Blog',
		href: '/blog',
	},
] satisfies NavLink[]

export const socialNav = [
	{
		title: 'Github',
		href: 'https://github.com/nichtsam',
		icon: <Icon name="github-logo" />,
	},
	{
		title: 'LinkedIn',
		href: 'https://www.linkedin.com/in/nichtsam/',
		icon: <Icon name="linkedin-logo" />,
	},
] satisfies NavLink[]
