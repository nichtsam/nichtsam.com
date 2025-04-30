import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Img } from 'openimg/react'
import { Form, Link, Outlet } from 'react-router'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '#app/components/ui/breadcrumb.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserId } from '#app/utils/auth/auth.server.ts'
import {
	type BreadcrumbHandle,
	useBreadcrumbs,
} from '#app/utils/breadcrumb.tsx'
import { cn, useIsPending } from '#app/utils/ui.ts'
import { useUser } from '#app/utils/user.tsx'
import { getImgSrc } from '../resources+/images.tsx'
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
			<Img
				className="size-40 rounded-full object-cover"
				height={320}
				width={320}
				src={
					user.image ? getImgSrc('object', user.image.object_key) : undefined
				}
				alt={`The image of ${user.display_name}`}
			/>
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

	if (breadcrumbs.length === 0) {
		return null
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map(({ id, pathname, breadcrumb }, i, { length }) => (
					<BreadcrumbItem key={id}>
						{i !== length - 1 ? (
							<>
								<BreadcrumbLink asChild>
									<Link to={pathname}>{breadcrumb}</Link>
								</BreadcrumbLink>
								<BreadcrumbSeparator />
							</>
						) : (
							<BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
						)}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
