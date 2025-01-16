import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { useSearchParams } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import { requireAnonymous } from '#app/utils/auth/auth.server.ts'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/auth/connections.tsx'
import { type Route } from './+types/login'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export const meta: Route.MetaFunction = () => {
	return [
		{ title: 'Login | nichtsam' },
		{
			name: 'description',
			content: 'Login to nichtsam.com',
		},
	]
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireAnonymous(request)

	return null
}

export default function Login() {
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	return (
		<div className="container max-w-lg md:mt-10">
			<Card>
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>Choose your path</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="flex flex-col gap-y-2">
						{providerNames.map((providerName) => (
							<li key={providerName}>
								<ProviderConnectionForm
									providerName={providerName}
									redirectTo={redirectTo}
								/>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}
