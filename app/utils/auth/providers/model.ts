import { type Strategy } from 'remix-auth'

export type ProviderUser = {
	id: string
	email: string
	username?: string
	name?: string
	imageUrl?: string
}

export interface AuthProvider {
	getAuthStrategy(): Strategy<ProviderUser, never>
	resolveConnectionInfo(profileId: string): Promise<
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
