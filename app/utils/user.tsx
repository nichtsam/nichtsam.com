import { type useLoaderData, useRouteLoaderData } from 'react-router'
import { type loader as rootLoader } from '#app/root.tsx'

export const isUser = (
	user: unknown,
): user is ReturnType<typeof useLoaderData<typeof rootLoader>>['user'] => {
	return (
		!!user &&
		typeof user === 'object' &&
		'id' in user &&
		typeof user.id === 'string'
	)
}

export const useOptionalUser = () => {
	const data = useRouteLoaderData<typeof rootLoader>('root')

	if (!data || !isUser(data.user)) {
		return null
	}

	return data.user
}

export const useUser = () => {
	const maybeUser = useOptionalUser()

	if (!maybeUser) {
		throw new Error(
			'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
		)
	}

	return maybeUser
}
