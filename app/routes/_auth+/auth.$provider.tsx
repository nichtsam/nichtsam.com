import { type ActionFunctionArgs } from '@remix-run/node'
import {
	GeneralErrorBoundary,
	generalNotFoundHandler,
} from '#app/components/error-boundary.tsx'
import { authenticator } from '#app/utils/auth/connections.server.ts'
import { ProviderNameSchema } from '#app/utils/auth/connections.tsx'
import { setRedirectCookie } from '#app/utils/redirect.server.ts'

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const providerName = ProviderNameSchema.parse(params.provider)

	try {
		return await authenticator.authenticate(providerName, request)
	} catch (errorOrResponse: unknown) {
		if (errorOrResponse instanceof Response) {
			const formData = await request.formData()
			const redirectTo = formData.get('redirectTo')
			if (typeof redirectTo === 'string') {
				errorOrResponse.headers.append(
					'set-cookie',
					setRedirectCookie(redirectTo),
				)
			}
		}
		throw errorOrResponse
	}
}

export async function loader() {
	throw new Response('Not found', { status: 404 })
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: generalNotFoundHandler,
			}}
		/>
	)
}
