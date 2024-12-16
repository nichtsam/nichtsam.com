import { ExternalLink } from '#app/components/link.tsx'
import { socialNav } from '#app/config/nav.tsx'
import { Button } from './ui/button.tsx'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from './ui/navigation-menu.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.tsx'

export function SiteFooter() {
	return (
		<footer>
			<div className="flex justify-center py-4">
				<NavigationMenu>
					<NavigationMenuList>
						{socialNav.map(({ href, title, icon }) => (
							<NavigationMenuItem key={href}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" asChild>
											<ExternalLink href={href} aria-label={title}>
												{icon}
											</ExternalLink>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>{title}</p>
									</TooltipContent>
								</Tooltip>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</footer>
	)
}
