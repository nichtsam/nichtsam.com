import { createCookie } from 'react-router'
import { createTypedCookie } from 'remix-utils/typed-cookie'
import { z } from 'zod'
import { env } from '#app/utils/env.server.ts'
import { unvariant } from '../misc.ts'
import { onboardingFormSchema } from './onboarding.ts'

const oauthSchema = z.object({
	type: z.literal('oauth'),
	providerId: z.string(),
	providerName: z.string(),
	profile: z
		.object({ email: z.string().email().optional() })
		.merge(onboardingFormSchema.omit({ rememberMe: true }).partial()),
})

const magicLinkSchema = z.object({
	type: z.literal('magic-link'),
	email: z.string().email(),
})

export const onboardingCookie = createTypedCookie({
	cookie: createCookie('_onboarding', {
		path: '/',
		sameSite: 'lax',
		httpOnly: true,
		maxAge: unvariant(env.NODE_ENV === 'production', 60 * 10),
		secrets: env.SESSION_SECRET.split(','),
		secure: env.NODE_ENV === 'production',
	}),
	schema: z.union([oauthSchema, magicLinkSchema]).nullable(),
})
