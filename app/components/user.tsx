import { useRef } from 'react'
import { Form, Link, useLocation, useSubmit } from 'react-router'
import { getUserImgSrc } from '#app/routes/resources+/user-images.$imageId.ts'
import { cn, useIsPending } from '#app/utils/ui.ts'
import { useOptionalUser, useUser } from '#app/utils/user.tsx'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx'
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
						<Avatar className="h-6 w-6">
							<AvatarImage
								src={user.image ? getUserImgSrc(user.image.id) : undefined}
								alt={`The image of ${user.display_name}`}
							/>
							<AvatarFallback>me</AvatarFallback>
						</Avatar>
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
