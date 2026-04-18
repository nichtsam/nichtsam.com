import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { coreNav } from '#app/config/nav.tsx'
import { ThemeSwitcher } from '#app/utils/theme.tsx'
import { NavLink } from './link'
import { Button } from './ui/button'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from './ui/drawer'
import { Icon } from './ui/icon'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from './ui/navigation-menu'

export function SiteHeader() {
	return (
		<header>
			<div className="flex items-center p-9 lg:gap-16">
				<Logo />
				<MainNav />
				<div className="-mr-16 grow" /> {/* Spacing adjustment */}
				<div className="flex gap-x-1">
					<MobileNav />
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	)
}

function MainNav() {
	return (
		<NavigationMenu className="hidden lg:flex">
			<NavigationMenuList>
				{coreNav.map(({ href, title }) => (
					<NavigationMenuItem key={href}>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							render={
								<NavLink prefetch="intent" to={href}>
									{title}
								</NavLink>
							}
						></NavigationMenuLink>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	)
}

let firstRender = true
function MobileNav() {
	const [open, setOpen] = useState(false)
	const location = useLocation()

	useEffect(() => {
		if (firstRender) {
			return
		}

		setOpen(false)
	}, [location.key, location.pathname])

	useEffect(() => {
		firstRender = false
	}, [])

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger className="lg:hidden" asChild>
				<Button size="icon" variant="ghost" aria-label="Navigation Menu">
					<Icon name="hamburger-menu" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="max-h-[60svh]">
				<DrawerHeader inert>
					<DrawerTitle>Menu</DrawerTitle>
					<DrawerDescription>Links and Actions</DrawerDescription>
				</DrawerHeader>
				<div className="overflow-auto p-4">
					<nav className="text-center">
						<ul className="flex flex-col gap-y-3">
							{coreNav.map(({ title, href }) => (
								<li key={href}>
									<Link prefetch="intent" to={href}>
										{title}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</DrawerContent>
		</Drawer>
	)
}

function Logo() {
	return (
		<Link className="hover:underline" to="/">
			<span className="text-xl font-bold sm:text-3xl">nichtsam</span>
		</Link>
	)
}
