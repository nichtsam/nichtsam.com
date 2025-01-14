import { type Strategy } from 'remix-auth/strategy'
import { type ServerTiming } from '#app/utils/timings.server.ts'

export type ProviderUser = {
	id: string
	email?: string
	username?: string
	name?: string | null
	imageUrl?: string
}

export interface AuthProvider {
	getAuthStrategy(request: Request): Strategy<ProviderUser, never>
	resolveConnectionInfo(
		profileId: string,
		options?: { timing?: ServerTiming },
	): Promise<
		| {
				connectionUserDisplayName: string
				profileLink: string | null
		  }
		| {
				connectionUserDisplayName: 'Unknown'
				profileLink: null
		  }
	>
}
