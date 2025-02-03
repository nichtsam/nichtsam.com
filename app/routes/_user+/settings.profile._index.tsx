import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { eq } from 'drizzle-orm'
import { redirect, Form, Link, type MetaArgs } from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { StatusButton } from '#app/components/status-button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '#app/components/ui/navigation-menu.tsx'
import {
	authSessionStorage,
	getAuthSession,
	requireUserId,
} from '#app/utils/auth/auth.server.ts'
import { validateCSRF } from '#app/utils/csrf.server.ts'
import { db } from '#app/utils/db.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { getFormData } from '#app/utils/request.server.ts'
import { useDoubleCheck, useIsPending } from '#app/utils/ui.ts'
import { userTable } from '#drizzle/schema.ts'
import { type Route } from './+types/settings.profile._index'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export const meta: Route.MetaFunction = (args) =>
	buildMeta(args as unknown as MetaArgs, {
		title: 'Profile | nichtsam',
		description: 'Your profile setting page on nichtsam.com',
	})

const INTENT_DELETE_ACCOUNT = 'INTENT_DELETE_ACCOUNT'

export const action = async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request)
	const formData = await getFormData(request)
	await validateCSRF(formData, request.headers)
	const intent = formData.get('intent')

	switch (intent) {
		case INTENT_DELETE_ACCOUNT: {
			return deleteAccount({ userId, request })
		}
		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function SettingProfile() {
	return (
		<div className="flex flex-col items-center gap-y-8">
			<NavigationMenu>
				<NavigationMenuList className="flex-col gap-y-1">
					<NavigationMenuItem>
						<NavigationMenuLink asChild>
							<Link
								prefetch="intent"
								to="connections"
								className={navigationMenuTriggerStyle()}
							>
								Manage Connections
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink asChild>
							<Link
								prefetch="intent"
								to="sessions"
								className={navigationMenuTriggerStyle()}
							>
								Check Sessions
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			<DeleteAccount />
		</div>
	)
}

const DeleteAccount = () => {
	const isPending = useIsPending()
	const dc = useDoubleCheck()

	return (
		<Form method="POST">
			<AuthenticityTokenInput />
			<StatusButton
				{...dc.getButtonProps({
					type: 'submit',
					name: 'intent',
					value: INTENT_DELETE_ACCOUNT,
				})}
				variant={dc.doubleCheck ? 'destructive' : 'default'}
				status={isPending ? 'pending' : 'idle'}
				className="flex gap-2 transition-none"
			>
				<Icon name="trash">
					{dc.doubleCheck ? 'Are you sure?' : 'Delete My Account'}
				</Icon>
			</StatusButton>
		</Form>
	)
}

const deleteAccount = async ({
	userId,
	request,
}: {
	userId: string
	request: Request
}) => {
	await db.delete(userTable).where(eq(userTable.id, userId))
	const { authSession } = await getAuthSession(request)

	return redirect('/', {
		headers: {
			'set-cookie': await authSessionStorage.destroySession(authSession),
		},
	})
}
