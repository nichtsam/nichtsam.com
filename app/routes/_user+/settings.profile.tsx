import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Form, Outlet } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserId } from '#app/utils/auth/auth.server.ts'
import {
	type BreadcrumbHandle,
	useBreadcrumbs,
} from '#app/utils/breadcrumb.tsx'
import { cn, useIsPending } from '#app/utils/ui.ts'
import { useUser } from '#app/utils/user.tsx'
import { getUserImgSrc } from '../resources+/user-images.$imageId.ts'
import { type Route } from './+types/settings.profile.ts'

export const handle: SEOHandle & BreadcrumbHandle = {
	getSitemapEntries: () => null,
	breadcrumb: <Icon name="user">Profile</Icon>,
}

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireUserId(request)

	return null
}

export default function SettingProfile() {
	return (
		<div className="container flex flex-col gap-y-8 py-4">
			<UserHeader />

			<Breadcrumbs />

			<Outlet />
		</div>
	)
}

const UserHeader = () => {
	const user = useUser()
	const isLoggingOut = useIsPending({ formAction: '/logout' })

	return (
		<div className="flex flex-col items-center gap-4">
			<Avatar className="h-40 w-40">
				<AvatarImage
					src={user.image ? getUserImgSrc(user.image.id) : undefined}
				/>
				<AvatarFallback>me</AvatarFallback>
			</Avatar>
			<div className="text-center">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
					{user.display_name}
				</h1>
				<p className="text-muted-foreground">
					Joined {user.createdAtFormatted}
				</p>
				<Form action="/logout" method="POST">
					<Button
						variant="link"
						type="submit"
						className={cn('inline-flex items-center gap-x-2', {
							'animate-pulse': isLoggingOut,
						})}
					>
						<Icon name="log-out">Log out</Icon>
					</Button>
				</Form>
			</div>
		</div>
	)
}

const Breadcrumbs = () => {
	const breadcrumbs = useBreadcrumbs({ minBreadcrumbs: 2 })

	if (!breadcrumbs) {
		return null
	}

	return (
		<ul className="flex flex-wrap gap-x-3">
			{breadcrumbs.map(({ id, element }, i, arr) => (
				<li
					key={id}
					className={cn('flex items-center gap-x-3', {
						'text-muted-foreground': i < arr.length - 1,
					})}
				>
					{i !== 0 ? <Icon name="chevron-right" /> : null}
					{element}
				</li>
			))}
		</ul>
	)
}
