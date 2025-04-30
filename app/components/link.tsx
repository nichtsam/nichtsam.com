import clsx from 'clsx'
import {
	NavLink as RemixNavLink,
	type NavLinkProps as RemixNavLinkProps,
} from 'react-router'

export interface NavLinkProps extends RemixNavLinkProps {}

export const NavLink = ({ className, ...props }: RemixNavLinkProps) => (
	<RemixNavLink
		{...props}
		className={({ isActive, isPending }) =>
			clsx(className, {
				'animate-pulse': isPending,
				underline: isActive,
			})
		}
	/>
)
NavLink.displayName = 'NavLink'

export const ExternalLink = ({ target = '_blank', ...props }) => (
	<a target={target} {...props} />
)
ExternalLink.displayName = 'ExternalLink'
