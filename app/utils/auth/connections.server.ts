import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import { env } from '#app/utils/env.server.ts'
import { type ServerTiming } from '../timings.server.ts'
import { type ProviderName } from './connections.tsx'
import { DiscordProvider } from './providers/discord.server.ts'
import { GitHubProvider } from './providers/github.server.ts'
import { type AuthProvider, type ProviderUser } from './providers/model.ts'

export const connectionSessionStorage = createCookieSessionStorage({
	cookie: {
		name: '_connection',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

export const providers: Record<ProviderName, AuthProvider> = {
	github: new GitHubProvider(),
	discord: new DiscordProvider(),
}

export const authenticator = new Authenticator<ProviderUser>(
	connectionSessionStorage,
)

for (const [providerName, provider] of Object.entries(providers)) {
	authenticator.use(provider.getAuthStrategy(), providerName)
}

export function resolveConnectionInfo({
	providerId,
	providerName,
	options,
}: {
	providerName: ProviderName
	providerId: string
	options?: { timing?: ServerTiming }
}) {
	return providers[providerName].resolveConnectionInfo(providerId, options)
}
