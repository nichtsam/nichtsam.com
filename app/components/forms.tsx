import { useId } from 'react'
import { Badge } from './ui/badge.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'

export type Errors = (string | null | undefined)[] | null | undefined
export interface ErrorListProps {
	errors?: Errors
	errorId?: string
}
export const ErrorList = ({ errorId, errors }: ErrorListProps) => {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null

	return (
		<ul id={errorId} className="text-de my-2 flex flex-col gap-2">
			{errors!.map((error) => (
				<li key={error}>
					<Badge variant="destructive">{error}</Badge>
				</li>
			))}
		</ul>
	)
}

export interface FieldProps {
	labelProps: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	errors?: (string | null | undefined)[] | null | undefined
	help?: string
}
export const Field = ({ labelProps, inputProps, errors, help }: FieldProps) => {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div className="my-2">
			<Label htmlFor={id} {...labelProps} />
			{help && <p className="mb-1 text-xs text-muted-foreground">{help}</p>}
			<Input
				aria-invalid={!!errorId}
				aria-describedby={errorId}
				{...inputProps}
				id={id}
			/>
			<ErrorList errorId={errorId} errors={errors} />
		</div>
	)
}
