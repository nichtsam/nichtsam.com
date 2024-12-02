import { type DiscordProfile, DiscordStrategy } from 'remix-auth-discord'
import { z } from 'zod'
import { cachified, longLivedCache } from '#app/utils/cache.server.ts'
import { env } from '#app/utils/env.server.ts'
import { type ServerTiming } from '#app/utils/timings.server.ts'
import { type AuthProvider } from './model.ts'

const DiscordUserSchema = z.object({ username: z.string() })
type DiscordUser = z.infer<typeof DiscordUserSchema>
const getDisplayName = (user: DiscordUser) => user.username
const getImageUr = (profile: DiscordProfile) => {
	const avaterHash = profile.photos?.[0].value
	if (!avaterHash) {
		return undefined
	}

	return `https://cdn.discordapp.com/avatars/${profile.id}/${avaterHash}.png`
}

export class DiscordProvider implements AuthProvider {
	getAuthStrategy() {
		return new DiscordStrategy(
			{
				clientID: env.DISCORD_CLIENT_ID,
				clientSecret: env.DISCORD_CLIENT_SECRET,
				callbackURL: '/auth/discord/callback',
				scope: ['identify', 'email', 'guilds'],
			},
			async ({ profile }) => {
				const id = profile.id
				const email = profile.__json.email
				if (!email) {
					throw new Error('Email is a must')
				}
				const username = profile.__json.username
				const name = profile.displayName
				const imageUrl = getImageUr(profile)

				return {
					id,
					email,
					username,
					name,
					imageUrl,
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
			timing,
			getFreshValue: async (context) => {
				const response = await fetch(
					`https://discord.com/api/users/${providerId}`,
					{
						headers: {
							Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
						},
					},
				)
				const rawJson = await response.json()
				const result = DiscordUserSchema.safeParse(rawJson)

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
