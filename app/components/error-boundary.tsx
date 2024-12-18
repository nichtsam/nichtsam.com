import {
	Link,
	isRouteErrorResponse,
	useLocation,
	useParams,
	useRouteError,
	type ErrorResponse,
	type Location,
} from '@remix-run/react'
import { type ReactElement } from 'react'
import { getErrorMessage } from '#app/utils/error.ts'
import { Icon } from './ui/icon.tsx'

type StatusHandler = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
	location: Location
}) => ReactElement | null

type UnexpectedErrorHandler = (info: {
	error: unknown
	params: Record<string, string | undefined>
	location: Location
}) => ReactElement | null

export const GeneralErrorBoundary = ({
	defaultStatusHandler,
	statusHandlers,
	unexpectedErrorHandler,
}: {
	defaultStatusHandler?: StatusHandler
	statusHandlers?: Record<number, StatusHandler>
	unexpectedErrorHandler?: UnexpectedErrorHandler
}) => {
	const error = useRouteError()
	const params = useParams()
	const location = useLocation()

	if (typeof document !== 'undefined') {
		console.error(error)
	}

	return (
		<div className="container flex items-center justify-center py-20">
			{isRouteErrorResponse(error)
				? (
						statusHandlers?.[error.status] ??
						defaultStatusHandler ??
						fallbackStatusHandler
					)({
						error,
						params,
						location,
					})
				: (unexpectedErrorHandler ?? fallbackUnexpectedErrorHandler)({
						error,
						params,
						location,
					})}
		</div>
	)
}

const fallbackStatusHandler: StatusHandler = ({ error }) => (
	<p>
		{error.status} {error.data}
	</p>
)

const fallbackUnexpectedErrorHandler: UnexpectedErrorHandler = ({ error }) => (
	<p>{getErrorMessage(error)}</p>
)

export const generalNotFoundHandler: StatusHandler & UnexpectedErrorHandler = ({
	location,
}) => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<h1 className="text-2xl sm:text-4xl md:text-5xl">
					We can't find this page
				</h1>
				<pre className="text-sm sm:text-lg md:text-xl">{location.pathname}</pre>
			</div>
			<Link to="/" className="flex items-center gap-2 self-start text-lg">
				<Icon name="arrow-left">Back to home</Icon>
			</Link>
		</div>
	)
}
