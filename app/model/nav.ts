import { type Icon } from '#app/components/ui/icon.tsx'

export type NavLink = {
	title: string
	href: string
	disabled?: boolean
	icon?: ReturnType<typeof Icon>
}
