import {
	type SubmissionResult,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	redirect,
	Form,
	useActionData,
	useLoaderData,
	data,
	type MetaArgs,
} from 'react-router'
import { ErrorList, Field } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/status-button.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import {
	SESSION_ID_KEY,
	authSessionStorage,
	getAuthSession,
	requireAnonymous,
	signUp,
	signUpWithConnection,
} from '#app/utils/auth/auth.server.ts'
import { onboardingCookie } from '#app/utils/auth/onboarding.server.ts'
import { onboardingFormSchema } from '#app/utils/auth/onboarding.ts'
import { db } from '#app/utils/db.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { destroyCookie, getFormData } from '#app/utils/request.server.ts'
import { useIsPending } from '#app/utils/ui.ts'
import { type Route } from './+types/onboarding'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export const meta: Route.MetaFunction = (args) =>
	buildMeta(args as unknown as MetaArgs, {
		title: 'Onboarding | nichtsam',
		description:
			'Welcome to the onboarding process! Fill in the necessary information and get started with your experience on nichtsam.com!',
	})

const requireData = async (request: Request) => {
	await requireAnonymous(request)

	const onboardingInfo = await onboardingCookie.parse(
		request.headers.get('cookie'),
	)

	if (onboardingInfo) {
		return onboardingInfo
	} else {
		throw redirect('/login')
	}
}

export const loader = async ({ request }: Route.LoaderArgs) => {
	const data = await requireData(request)

	switch (data.type) {
		case 'oauth': {
			return {
				email: data.profile.email,
				prefillResult: {
					initialValue: data.profile,
					error: {},
				} satisfies SubmissionResult,
			}
		}
		case 'magic-link': {
			return {
				email: data.email,
				prefillResult: {
					initialValue: {
						email: data.email,
					},
					error: {},
				} satisfies SubmissionResult,
			}
		}
		default:
			throw new Error('Unknown Onboarding Type')
	}
}

export const action = async ({ request }: Route.ActionArgs) => {
	const onboardingData = await requireData(request)
	const formData = await getFormData(request)

	const submission = await parseWithZod(formData, {
		schema: onboardingFormSchema
			.refine(
				async (data) => {
					const existingUser = await db.query.userTable.findFirst({
						where: (userTable, { eq }) => eq(userTable.username, data.username),
					})

					return !existingUser
				},
				{
					message: 'A user already exists with this username :(',
					path: ['username'],
				},
			)
			.transform(
				async ({ email, displayName, username, imageUrl, rememberMe }) => {
					switch (onboardingData.type) {
						case 'oauth': {
							const session = await signUpWithConnection({
								connection: {
									provider_id: onboardingData.providerId,
									provider_name: onboardingData.providerName,
								},
								user: {
									email,
									username,
									display_name: displayName,
									imageUrl,
								},
							})
							return { session, rememberMe }
						}
						case 'magic-link': {
							const { session } = await signUp({
								user: {
									email,
									username,
									display_name: displayName,
									imageUrl,
								},
							})

							return { session, rememberMe }
						}
					}
				},
			),
		async: true,
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { session, rememberMe } = submission.value

	const { authSession } = await getAuthSession(request)
	authSession.set(SESSION_ID_KEY, session.id)

	const headers = new Headers()

	headers.append('set-cookie', await destroyCookie(onboardingCookie))
	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(authSession, {
			expires: rememberMe ? session.expiration_at : undefined,
		}),
	)

	throw redirect('/', {
		headers,
	})
}

export default function OnBoarding() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'onboarding-provider-form',
		constraint: getZodConstraint(onboardingFormSchema),
		lastResult: actionData?.result ?? data.prefillResult,
		shouldRevalidate: 'onBlur',
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: onboardingFormSchema }),
	})

	return (
		<div className="container max-w-lg md:mt-10 lg:max-w-3xl">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-4xl md:text-6xl lg:text-7xl">
						Hey there!
					</CardTitle>
					<CardDescription className="text-lg md:text-2xl lg:text-3xl">
						Tell us about you.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form method="post" {...getFormProps(form)}>
						{fields.imageUrl.initialValue ? (
							<div className="mb-8 flex flex-col items-center justify-start gap-2">
								<img
									src={fields.imageUrl.initialValue}
									alt={`avatar of you`}
									className="h-24 w-24 rounded-full"
								/>
								<p className="text-sm text-muted-foreground">
									You can change this later.
								</p>

								<input
									{...getInputProps(fields.imageUrl, { type: 'hidden' })}
								/>
							</div>
						) : null}
						<Field
							labelProps={{ children: 'Email' }}
							inputProps={{
								...getInputProps(fields.email, { type: 'email' }),
								readOnly: !!data.prefillResult.initialValue.email,
								autoComplete: 'name',
							}}
							errors={fields.email.errors}
							help={
								data.prefillResult.initialValue.email
									? undefined
									: "We didn't find any email linked, please input one."
							}
						/>
						<Field
							labelProps={{ children: 'How should we call you?' }}
							inputProps={{
								...getInputProps(fields.displayName, { type: 'text' }),
								autoComplete: 'name',
							}}
							errors={fields.displayName.errors}
							help="Name for display purpose."
						/>
						<Field
							labelProps={{ children: 'Choose a username!' }}
							inputProps={{
								...getInputProps(fields.username, { type: 'text' }),
								autoComplete: 'username',
								className: 'lowercase',
							}}
							errors={fields.username.errors}
							help="A unique identifier for your account."
						/>

						{/* TODO Remember Me Checkbox */}

						<ErrorList errorId={form.errorId} errors={form.errors} />
						<StatusButton
							type="submit"
							className="mt-6 w-full"
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							disabled={isPending}
						>
							Go onboard!
						</StatusButton>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
