import { Img } from 'openimg/react'
import { useRef } from 'react'
import { Form, Link, useLocation, useSubmit } from 'react-router'
import { getImgSrc } from '#app/routes/resources+/images.tsx'
import { cn, useIsPending } from '#app/utils/ui.ts'
import { useOptionalUser, useUser } from '#app/utils/user.tsx'
import { Button } from './ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu.tsx'
import { Icon } from './ui/icon.tsx'

export const UserButton = () => {
	const maybeUser = useOptionalUser()
	const location = useLocation()

	if (!maybeUser) {
		return (
			<Button asChild>
				<Link
					to={
						location.pathname !== '/'
							? `login?redirectTo=${location.pathname}`
							: 'login'
					}
				>
					Login
				</Link>
			</Button>
		)
	}

	return <UserActions />
}

export const UserActions = () => {
	const user = useUser()

	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)

	const isLoggingOut = useIsPending({ formAction: '/logout' })

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="outline">
					<Link
						className="flex gap-x-2"
						to={`/settings/profile`}
						onClick={(e) => e.preventDefault()}
					>
						<Img
							className="size-6 rounded-full object-cover"
							height={24}
							width={24}
							src={
								user.image
									? getImgSrc('object', user.image.object_key)
									: undefined
							}
							alt={`The image of ${user.display_name}`}
						/>
						{user.display_name}
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<Link
						prefetch="intent"
						to={`/settings/profile`}
						className="flex items-center gap-x-2"
					>
						<Icon name="user">Profile</Icon>
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem
					asChild
					onSelect={async (event) => {
						event.preventDefault()
						await submit(formRef.current)
					}}
				>
					<Form action="/logout" method="POST" ref={formRef}>
						<button
							type="submit"
							className={cn('flex items-center gap-x-2', {
								'animate-pulse': isLoggingOut,
							})}
						>
							<Icon name="log-out">Log out</Icon>
						</button>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
