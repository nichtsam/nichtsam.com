import { Form } from '@remix-run/react'
import { z } from 'zod'
import { StatusButton } from '#app/components/status-button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { useIsPending } from '../ui.ts'

export const GITHUB_PROVIDER_NAME = 'github'

export const providerNames = [GITHUB_PROVIDER_NAME] as const
export const ProviderNameSchema = z.enum(providerNames)
export type ProviderName = z.infer<typeof ProviderNameSchema>

export type ProviderConfig = {
	label: string
	icon?: React.ReactNode
}
export const providerConfigs: Record<ProviderName, ProviderConfig> = {
	[GITHUB_PROVIDER_NAME]: {
		label: 'Github',
		icon: <Icon name="github-logo" className="inline-block" />,
	},
}

export const ProviderConnectionForm = ({
	providerName,
	redirectTo,
}: {
	providerName: ProviderName
	redirectTo?: string | null
}) => {
	const formAction = `/auth/${providerName}`

	const config = providerConfigs[providerName]
	const label = config.label
	const icon = config.icon

	const isPending = useIsPending({ formAction })

	return (
		<Form method="POST" action={formAction}>
			{redirectTo ? (
				<input type="hidden" name="redirectTo" value={redirectTo} />
			) : null}
			<StatusButton
				status={isPending ? 'pending' : 'idle'}
				type="submit"
				className="w-full"
			>
				<span className="inline-flex items-center gap-2">
					{icon}
					{label}
				</span>
			</StatusButton>
		</Form>
	)
}
