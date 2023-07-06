import { NavLink as RemixNavLink } from "@remix-run/react";
import type { NavLinkProps as RemixNavLinkProps } from "@remix-run/react";
import clsx from "clsx";
import { forwardRef } from "react";

export interface NavLinkProps extends RemixNavLinkProps {}

// eslint-disable-next-line react/display-name
export const NavLink = forwardRef<HTMLAnchorElement | null, NavLinkProps>(
  ({ className, ...props }, ref) => (
    <RemixNavLink
      ref={ref}
      {...props}
      className={({ isActive }) =>
        clsx(className, "transition-colors", {
          "text-primary underline": isActive,
          "text-secondary hover:text-current hover:underline": !isActive,
        })
      }
    />
  )
);

// TODO
export const ExternalLink = () => {};

// TODO
export const DownloadLink = () => {};
