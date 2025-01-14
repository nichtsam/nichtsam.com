import { z } from 'zod'

export const onboardingFormSchema = z.object({
	email: z.string().email(),
	username: z.string(),
	displayName: z.string(),
	imageUrl: z.string().url().optional(),

	rememberMe: z.boolean().default(false),
})
