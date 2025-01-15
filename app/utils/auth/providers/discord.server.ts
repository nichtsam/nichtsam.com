import { DiscordStrategy } from '@nichtsam/remix-auth-discord'
import { z } from 'zod'
import { cachified, longLivedCache } from '#app/utils/cache.server.ts'
import { env } from '#app/utils/env.server.ts'
import { type ServerTiming } from '#app/utils/timings.server.ts'
import { type AuthProvider } from './model.ts'

const getEmail = (profile: Profile) =>
	profile.verified && profile.email ? profile.email : undefined
const getDisplayName = (profile: Profile) =>
	profile.global_name ?? profile.username
const getAvatarUrl = (profile: Profile) =>
	profile.avatar
		? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
		: undefined

// pick needed from here: https://discord.com/developers/docs/resources/user#user-object
type Profile = z.infer<typeof ProfileSchema>
const ProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	global_name: z.string().nullable(),
	email: z.string().nullable().optional(),
	verified: z.boolean().optional(),
	avatar: z.string().nullable(),
})
const getProfile = async (accessToken: string) => {
	const response = await fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})

	const result = ProfileSchema.safeParse(await response.json())
	if (!result.success) {
		throw new Error(
			'Corrupted discord profile, make sure the schema is in sync with lastet github api schema',
		)
	}
	return result.data
}

export class DiscordProvider implements AuthProvider {
	getAuthStrategy(request: Request) {
		return new DiscordStrategy(
			{
				clientId: env.DISCORD_CLIENT_ID,
				clientSecret: env.DISCORD_CLIENT_SECRET,
				redirectURI: new URL('/auth/discord/callback', request.url),
				scopes: ['identify', 'email'],
			},
			async ({ tokens }) => {
				const accessToken = tokens.accessToken()
				const profile = await getProfile(accessToken)

				return {
					id: profile.id,
					email: getEmail(profile),
					username: profile.username,
					name: getDisplayName(profile),
					imageUrl: getAvatarUrl(profile),
				}
			},
		)
	}

	async resolveConnectionInfo(
		providerId: string,
		{ timing }: { timing?: ServerTiming } = {},
	) {
		const result = await cachified({
			key: `connection-info:discord:${providerId}`,
			cache: longLivedCache,
			ttl: 1000 * 60,
			swr: 1000 * 60 * 60 * 24 * 7,
			timing,
			getFreshValue: async (context) => {
				const response = await fetch(
					`https://discord.com/api/v10/users/${providerId}`,
					{
						headers: {
							Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
						},
					},
				)
				const rawJson = await response.json()
				const result = ProfileSchema.safeParse(rawJson)

				if (!result.success) {
					context.metadata.ttl = 0
				}

				return result
			},
		})

		if (!result.success) {
			return {
				connectionUserDisplayName: 'Unknown' as const,
				profileLink: null,
			}
		}

		return {
			connectionUserDisplayName: getDisplayName(result.data),
			profileLink: null,
		}
	}
}
