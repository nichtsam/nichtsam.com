import { type SEOHandle } from '@nasa-gcn/remix-seo'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import { without } from 'ramda'
import { useFetcher, useLoaderData, data, type MetaArgs } from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { StatusButton } from '#app/components/status-button.tsx'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'
import { requireUserId } from '#app/utils/auth/auth.server.ts'
import { resolveConnectionInfo } from '#app/utils/auth/connections.server.ts'
import {
	providerConfigs,
	ProviderNameSchema,
	type ProviderName,
	ProviderConnectionForm,
	providerNames as supportedProviderNames,
} from '#app/utils/auth/connections.tsx'
import { type BreadcrumbHandle } from '#app/utils/breadcrumb.tsx'
import { validateCSRF } from '#app/utils/csrf.server.ts'
import { db } from '#app/utils/db.server.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { getFormData } from '#app/utils/request.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'
import { useDoubleCheck } from '#app/utils/ui.ts'
import { connectionTable } from '#drizzle/schema.ts'
import { type Route } from './+types/settings.profile.connections'

export const handle: SEOHandle & BreadcrumbHandle = {
	getSitemapEntries: () => null,
	breadcrumb: (
		<span className="flex items-center gap-x-2">
			<Icon name="link">Connections</Icon>
		</span>
	),
}

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'Connections | nichtsam',
			description: 'Manage your connections of your account on nichtsam.com',
		},
	})

export const headers: Route.HeadersFunction = pipeHeaders

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireUserId(request)
	const timing = new ServerTiming()
	const connections = await getConnections(userId, timing)

	return data(
		{ connections },
		{ headers: { 'Server-Timing': timing.toString() } },
	)
}

type ActionArgs = {
	request: Request
	formData: FormData
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await getFormData(request)
	await validateCSRF(formData, request.headers)
	const intent = formData.get('intent')

	switch (intent) {
		case INTENT_DELETE_CONNECTION: {
			return deleteConnection({ formData, request })
		}
		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function ProfileConnections() {
	const data = useLoaderData<typeof loader>()
	const connectedProviderNames = data.connections.map((c) => c.providerName)
	const missingProviderNames = without(
		connectedProviderNames,
		supportedProviderNames,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Connections</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-y-8">
				{data.connections.length > 0 && (
					<Table>
						<TableCaption>A list of your connections.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Provider</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Connected At</TableHead>
								<TableHead className="w-12">Delete</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.connections.map((connection) => (
								<ConnectionRow key={connection.connectionId} {...connection} />
							))}
						</TableBody>
					</Table>
				)}

				{missingProviderNames.length > 0 && (
					<div className="flex flex-col gap-y-4">
						<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
							Connect with new platform
						</h4>
						{missingProviderNames.map((providerName) => (
							<ProviderConnectionForm
								key={providerName}
								providerName={providerName}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

interface ConnectionRowProps {
	providerName: ProviderName
	connectionId: string
	connectionUserDisplayName: string
	profileLink?: string | null
	createdAtFormatted: string
}
const ConnectionRow = ({
	connectionId,
	providerName,
	profileLink,
	connectionUserDisplayName,
	createdAtFormatted,
}: ConnectionRowProps) => {
	const providerIcon = providerConfigs[providerName].icon
	const providerLabel = providerConfigs[providerName].label
	const name = profileLink ? (
		<a href={profileLink} className="underline">
			{connectionUserDisplayName}
		</a>
	) : (
		<span>{connectionUserDisplayName}</span>
	)

	return (
		<TableRow>
			<TableCell>
				<span className="inline-flex items-center gap-x-2">
					{providerIcon}
					{providerLabel}
				</span>
			</TableCell>
			<TableCell>{name}</TableCell>
			<TableCell>{createdAtFormatted}</TableCell>
			<TableCell className="text-right">
				<DeleteConnectionButton connectionId={connectionId} />
			</TableCell>
		</TableRow>
	)
}

const DeleteConnectionButton = ({ connectionId }: { connectionId: string }) => {
	const dc = useDoubleCheck()
	const fetcher = useFetcher<typeof action>()

	return (
		<fetcher.Form method="POST">
			<AuthenticityTokenInput />
			<input name="connectionId" value={connectionId} hidden readOnly />
			<Tooltip>
				<TooltipTrigger asChild>
					<StatusButton
						{...dc.getButtonProps({
							type: 'submit',
							name: 'intent',
							value: INTENT_DELETE_CONNECTION,
						})}
						variant={dc.doubleCheck ? 'destructive' : 'ghost'}
						status={fetcher.state !== 'idle' ? 'pending' : 'idle'}
					>
						{fetcher.state === 'idle' && <Icon name="trash" />}
					</StatusButton>
				</TooltipTrigger>
				<TooltipContent>Disconnect this account</TooltipContent>
			</Tooltip>
		</fetcher.Form>
	)
}

const getConnections = async (userId: string, timing: ServerTiming) => {
	timing.time('get user raw connections', "Get user's raw connections")
	const rawConnections = await db.query.connectionTable.findMany({
		where: (connections, { eq }) => eq(connections.user_id, userId),
		columns: {
			id: true,
			provider_id: true,
			provider_name: true,
			created_at: true,
		},
	})
	timing.timeEnd('get user raw connections')

	const connections: Array<{
		providerName: ProviderName
		connectionId: string
		connectionUserDisplayName: string
		profileLink?: string | null
		createdAtFormatted: string
	}> = []

	for (const connection of rawConnections) {
		const parsed = ProviderNameSchema.safeParse(connection.provider_name)
		if (!parsed.success) {
			continue
		}

		const { data: providerName } = parsed

		const connectionInfo = await resolveConnectionInfo({
			providerName: parsed.data,
			providerId: connection.provider_id,
			options: { timing },
		})

		connections.push({
			...connectionInfo,
			providerName: providerName,
			connectionId: connection.id,
			createdAtFormatted: dayjs(connection.created_at).format(
				'YYYY-MM-DD HH:mm:ss ZZ',
			),
		})
	}

	return connections
}

const INTENT_DELETE_CONNECTION = 'INTENT_DELETE_CONNECTION'

const deleteConnection = async ({ formData }: ActionArgs) => {
	const connectionId = formData.get('connectionId')
	if (typeof connectionId !== 'string') {
		throw new Response('Invalid connectionId', { status: 400 })
	}

	await db.delete(connectionTable).where(eq(connectionTable.id, connectionId))

	return { status: 'success' } as const
}
