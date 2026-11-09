import { z } from 'zod'

export type Env = z.infer<typeof envSchema>
const envSchema = z
	.object({
		NODE_ENV: z.enum(['development', 'production', 'test']),

		ALLOW_INDEXING: z
			.enum(['true', 'false'])
			.default('true')
			.transform((s) => s !== 'false'),
	})
	.readonly()

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error(
		'❌ Invalid environment variables:',
		parsedEnv.error.flatten().fieldErrors,
	)

	throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data

export type PublicEnv = typeof publicEnv
export const publicEnv = {
	ALLOW_INDEXING: env.ALLOW_INDEXING,
}

// To ensure env safety, I want to force environment validation to happen as soon as possible.
// Meaning at the top level, in `entry.server.tsx` and `root.tsx`,
// I don't necessarily use anything of this file there,
// so this is to create a module side effect, to make sure that this file is included.
// Might be other way, temporary solution.
// ref: https://remix.run/docs/en/main/guides/constraints#no-module-side-effects
export const forceEnvValidation = () => {}
