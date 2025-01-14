import { GitHubStrategy } from 'remix-auth-github'
import { z } from 'zod'
import { cachified, longLivedCache } from '#app/utils/cache.server.ts'
import { env } from '#app/utils/env.server.ts'
import { type ServerTiming } from '#app/utils/timings.server.ts'
import { type AuthProvider } from './model.ts'

const getDisplayName = (profile: Profile) => profile.login
const getProfileLink = (profile: Profile) =>
	`https://github.com/${profile.login}`

// pick needed from here: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
type Profile = z.infer<typeof ProfileSchema>
const ProfileSchema = z.object({
	avatar_url: z.string().url(),
	login: z.string(),
	name: z.string().nullable(),
	id: z.number(),
})
const getProfile = async (accessToken: string) => {
	const response = await fetch('https://api.github.com/user', {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`,
			'X-GitHub-Api-Version': '2022-11-28',
		},
	})

	const result = ProfileSchema.safeParse(await response.json())
	if (!result.success) {
		throw new Error(
			'Corrupted github profile, make sure the schema is in sync with lastet github api schema',
		)
	}
	return result.data
}

const EmailsSchema = z.array(
	z.object({
		email: z.string(),
		primary: z.boolean(),
		verified: z.boolean(),
	}),
)
const getEmails = async (accessToken: string) => {
	const response = await fetch('https://api.github.com/user/emails', {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: `token ${accessToken}`,
			'X-GitHub-Api-Version': '2022-11-28',
		},
	})

	const result = EmailsSchema.safeParse(await response.json())
	if (!result.success) {
		throw new Error(
			'Corrupted github emails, make sure the schema is in sync with lastet github api schema',
		)
	}

	const emails = result.data
		.filter(({ verified }) => verified)
		.sort((a, b) => {
			return -(+a.primary - +b.primary)
		})
		.map(({ email }) => email)

	return emails
}

export class GitHubProvider implements AuthProvider {
	getAuthStrategy(request: Request) {
		return new GitHubStrategy(
			{
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				redirectURI: new URL('/auth/github/callback', request.url),
				scopes: ['user'],
			},
			async ({ tokens }) => {
				const accessToken = tokens.accessToken()
				const [profile, emails] = await Promise.all([
					getProfile(accessToken),
					getEmails(accessToken),
				])

				return {
					email: emails[0],
					id: profile.id.toString(),
					username: profile.login,
					name: profile.name,
					imageUrl: profile.avatar_url,
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
			profileLink: getProfileLink(result.data),
		}
	}
}
