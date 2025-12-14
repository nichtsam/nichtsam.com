import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	data,
	Form,
	type MetaArgs,
	useActionData,
	useSearchParams,
} from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Field } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/status-button.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import { Separator } from '#app/components/ui/separator.tsx'
import { requireAnonymous } from '#app/utils/auth/auth.server.ts'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/auth/connections.tsx'
import { createAuthenticator } from '#app/utils/auth/magic-link.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.tsx'
import { buildMeta } from '#app/utils/meta.ts'
import { combineHeaders, getFormData } from '#app/utils/request.server.ts'
import { createToastHeaders } from '#app/utils/toast.server.ts'
import { useIsPending } from '#app/utils/ui.ts'
import { type Route } from './+types/login'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Login | nichtsam',
			description: 'Login to nichtsam.com',
		},
	})

export async function loader({ request }: Route.LoaderArgs) {
	await requireAnonymous(request)

	return null
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await getFormData(request)
	await checkHoneypot(formData)

	const submission = parseWithZod(formData, {
		schema: MagicLinkLoginSchema,
	})

	if (submission.status !== 'success') {
		return data(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const authenticator = createAuthenticator(request)
	const authHeaders = (await authenticator
		.authenticate('email-link', request)
		.catch((unknown) => {
			if (unknown instanceof Headers) {
				return unknown
			}
			throw unknown
		})) as Headers

	const toastHeaders = await createToastHeaders({
		title: '✨ Magic Link has been sent',
		message: `sent to ${submission.value.email}`,
	})

	return data(
		{ result: submission.reply() },
		{
			headers: combineHeaders(authHeaders, toastHeaders),
		},
	)
}

export default function Login() {
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	return (
		<div className="container max-w-lg md:mt-10">
			<Card>
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>Choose your path</CardDescription>
				</CardHeader>
				<CardContent>
					<MagicLinkLogin />
					<Separator className="my-4" />
					<ul className="flex flex-col gap-y-2">
						{providerNames.map((providerName) => (
							<li key={providerName}>
								<ProviderConnectionForm
									providerName={providerName}
									redirectTo={redirectTo}
								/>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}

export const MagicLinkLoginSchema = z.object({
	email: z.string().email(),
})

function MagicLinkLogin() {
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const [form, fields] = useForm({
		id: 'magic-link-login-form',
		constraint: getZodConstraint(MagicLinkLoginSchema),
		lastResult: actionData?.result,
		shouldRevalidate: 'onBlur',
		onValidate: ({ formData }) =>
			parseWithZod(formData, { schema: MagicLinkLoginSchema }),
	})

	return (
		<Form method="post" {...getFormProps(form)}>
			<HoneypotInputs />

			<Field
				labelProps={{ children: 'Email' }}
				inputProps={{
					...getInputProps(fields.email, { type: 'email' }),
					autoComplete: 'email',
				}}
				errors={fields.email.errors}
			/>
			<StatusButton
				type="submit"
				className="w-full"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
			>
				Email a login link
			</StatusButton>
		</Form>
	)
}

export const ErrorBoundary = GeneralErrorBoundary
