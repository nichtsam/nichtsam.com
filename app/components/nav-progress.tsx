import * as ProgressPrimitive from '@radix-ui/react-progress'
import { useNavigation } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import { cn } from '#app/utils/ui.ts'
import { Icon } from './ui/icon.tsx'

function NavProgress() {
	const navigation = useNavigation()
	const busy = useSpinDelay(navigation.state !== 'idle', {
		delay: 400,
		minDuration: 1000,
	})

	const [animationComplete, setAnimationComplete] = useState(true)
	const indicatorRef = useRef<HTMLDivElement>(null)

	let progressRate = 0
	if (busy && !animationComplete) progressRate = 100
	if (busy && navigation.state === 'submitting') progressRate = 35
	if (busy && navigation.state === 'loading') progressRate = 70

	useEffect(() => {
		if (!indicatorRef.current) return
		if (busy) {
			setAnimationComplete(false)
			return
		} else {
			const animationPromises = indicatorRef.current
				.getAnimations()
				.map(({ finished }) => finished)

			void Promise.allSettled(animationPromises).then(() => {
				setAnimationComplete(true)
			})
		}
	}, [busy])

	return (
		<div
			role="progressbar"
			aria-label="Page Navigation Progress"
			aria-hidden={busy ? undefined : true}
			aria-valuetext={busy ? 'Loading' : 'Idle'}
			aria-valuenow={progressRate}
			aria-valuemax={100}
			aria-valuemin={0}
			className={cn(
				'pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-end transition-all duration-500',
				!busy && 'opacity-0',
			)}
		>
			<ProgressPrimitive.Root
				className={cn('relative h-1 w-full overflow-hidden bg-primary/20')}
			>
				<ProgressPrimitive.Indicator
					ref={indicatorRef}
					className="h-full w-full flex-1 bg-primary transition-all duration-500"
					style={{ transform: `translateX(-${100 - progressRate}%)` }}
				/>
			</ProgressPrimitive.Root>
			<Icon
				name="loader-circle"
				className={cn('m-1', { 'animate-spin': !animationComplete })}
				aria-hidden
			/>
		</div>
	)
}

export { NavProgress }
