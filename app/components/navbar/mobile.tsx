import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLocation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { NavLink } from '../link.tsx'
import { Button } from '../ui/button.tsx'
import { Icon } from '../ui/icon.tsx'
import { ScrollArea } from '../ui/scroll-area.tsx'
import { SheetTrigger, SheetContent, Sheet, SheetFooter } from '../ui/sheet.tsx'
import { UserButton } from '../user.tsx'
import { CORE_CONTENT_LINKS } from './constant.ts'

let firstRender = true

export const MobileNavigation = () => {
	const [open, setOpen] = useState(false)

	const location = useLocation()

	const onOpenChange = (open: boolean) => {
		setOpen(open)
	}

	const closeDialog = () => {
		setOpen(false)
	}

	useEffect(() => {
		if (firstRender) {
			return
		}

		closeDialog()
	}, [location.key, location.pathname])

	useEffect(() => {
		firstRender = false
	}, [])

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button size="icon" variant="ghost" aria-label="Navigation Menu">
					<Icon name="hamburger-menu" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="flex flex-col gap-y-4" forceMount>
				<VisuallyHidden>
					<DialogTitle>Navigation Menu</DialogTitle>
					<DialogDescription>
						Here goes the navigation and some other settings
					</DialogDescription>
				</VisuallyHidden>

				<ScrollArea className="flex-1">
					<NavigationMenu.Root
						className="text-sm font-bold"
						orientation="vertical"
					>
						<NavigationMenu.List className="text-3xl">
							{CORE_CONTENT_LINKS.map((link) => (
								<NavigationMenu.Item key={link.to}>
									<NavLink to={link.to}>{link.name}</NavLink>
								</NavigationMenu.Item>
							))}
						</NavigationMenu.List>
					</NavigationMenu.Root>
				</ScrollArea>

				<SheetFooter>
					<UserButton />
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
