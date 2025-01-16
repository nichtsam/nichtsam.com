import { type ClassValue, clsx } from 'clsx'
import { useState } from 'react'
import { useFormAction, useNavigation } from 'react-router'
import { useSpinDelay } from 'spin-delay'
import { twMerge } from 'tailwind-merge'
import { generateCallAll } from './misc.ts'

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function useIsPending({
	formAction,
	formMethod = 'POST',
	state = 'non-idle',
}: {
	formAction?: string
	formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
	state?: 'submitting' | 'loading' | 'non-idle'
} = {}) {
	const contextualFormAction = useFormAction()
	const navigation = useNavigation()
	const isPendingState =
		state === 'non-idle'
			? navigation.state !== 'idle'
			: navigation.state === state

	return (
		isPendingState &&
		navigation.formAction === (formAction ?? contextualFormAction) &&
		navigation.formMethod === formMethod
	)
}

function useDelayedIsPending({
	formAction,
	formMethod,
	delay = 400,
	minDuration = 300,
}: Parameters<typeof useIsPending>[0] &
	Parameters<typeof useSpinDelay>[1] = {}) {
	const isPending = useIsPending({ formAction, formMethod })
	const delayedIsPending = useSpinDelay(isPending, {
		delay,
		minDuration,
	})
	return delayedIsPending
}

function useDoubleCheck() {
	const [doubleCheck, setDoubleCheck] = useState(false)

	function getButtonProps(
		props?: React.ButtonHTMLAttributes<HTMLButtonElement>,
	) {
		const onBlur: React.ButtonHTMLAttributes<HTMLButtonElement>['onBlur'] =
			() => setDoubleCheck(false)

		const onClick: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'] =
			doubleCheck
				? undefined
				: (e) => {
						e.preventDefault()
						setDoubleCheck(true)
					}

		const onKeyUp: React.ButtonHTMLAttributes<HTMLButtonElement>['onKeyUp'] = (
			e,
		) => {
			if (e.key === 'Escape') {
				setDoubleCheck(false)
			}
		}

		return {
			...props,
			onBlur: generateCallAll(onBlur, props?.onBlur),
			onClick: generateCallAll(onClick, props?.onClick),
			onKeyUp: generateCallAll(onKeyUp, props?.onKeyUp),
		}
	}

	return { doubleCheck, getButtonProps }
}

export { cn, useIsPending, useDelayedIsPending, useDoubleCheck }
