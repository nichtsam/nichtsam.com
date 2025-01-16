import clsx from 'clsx'
import { type AnchorHTMLAttributes, forwardRef } from 'react'
import {
	NavLink as RemixNavLink,
	type NavLinkProps as RemixNavLinkProps,
} from 'react-router'

export interface NavLinkProps extends RemixNavLinkProps {}

export const NavLink = forwardRef<HTMLAnchorElement | null, NavLinkProps>(
	({ className, ...props }, ref) => (
		<RemixNavLink
			ref={ref}
			{...props}
			className={({ isActive, isPending }) =>
				clsx(className, {
					'animate-pulse': isPending,
					underline: isActive,
				})
			}
		/>
	),
)
NavLink.displayName = 'NavLink'

export const ExternalLink = forwardRef<
	HTMLAnchorElement | null,
	AnchorHTMLAttributes<HTMLAnchorElement>
>(({ target = '_blank', children, ...props }, ref) => (
	<a target={target} ref={ref} children={children} {...props} />
))
ExternalLink.displayName = 'ExternalLink'

// TODO
export const DownloadLink = () => {}
