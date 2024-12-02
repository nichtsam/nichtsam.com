import { type Strategy } from 'remix-auth'
import { type ServerTiming } from '#app/utils/timings.server.ts'

export type ProviderUser = {
	id: string
	email: string
	username?: string
	name?: string
	imageUrl?: string
}

export interface AuthProvider {
	getAuthStrategy(): Strategy<ProviderUser, never>
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
