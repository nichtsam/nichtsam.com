import { GitHubStrategy } from 'remix-auth-github'
import { z } from 'zod'
import { cachified, longLivedCache } from '#app/utils/cache.server.ts'
import { env } from '#app/utils/env.server.ts'
import { type ServerTiming } from '#app/utils/timings.server.ts'
import { type AuthProvider } from './model.ts'

// pick needed from here: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
const GithubUserSchema = z.object({ login: z.string() })
type GithubUser = z.infer<typeof GithubUserSchema>
const getDisplayName = (user: GithubUser) => user.login
const getProfileLink = (user: GithubUser) => `https://github.com/${user.login}`

export class GitHubProvider implements AuthProvider {
	getAuthStrategy() {
		return new GitHubStrategy(
			{
				clientID: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				callbackURL: '/auth/github/callback',
			},
			async ({ profile }) => {
				const email = profile.emails[0]!.value.trim().toLowerCase()
				const username = profile.displayName
				const imageUrl = profile.photos[0]?.value

				return {
					email,
					id: profile.id,
					username,
					name: profile.name.givenName,
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
			key: `connection-info:github:${providerId}`,
			cache: longLivedCache,
			ttl: 1000 * 60,
			swr: 1000 * 60 * 60 * 24 * 7,
			timing,
			getFreshValue: async (context) => {
				const response = await fetch(
					`https://api.github.com/user/${providerId}`,
				)
				const rawJson = await response.json()
				const result = GithubUserSchema.safeParse(rawJson)

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
			profileLink: getProfileLink(result.data),
		}
	}
}
