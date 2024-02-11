import type { UIMatch } from "@remix-run/react";
import { Link, useMatches } from "@remix-run/react";
import { isValidElement, type ReactNode } from "react";
import { z } from "zod";

const breadcrumbSchema = z.custom<
  Exclude<ReactNode, boolean | null | undefined>
>((data) => !!data && (isValidElement(data) || typeof data !== "object"));
const breadcrumbHandleSchema = z.object({ breadcrumb: breadcrumbSchema });
const breadcrumbMatchSchema = z.object({
  handle: breadcrumbHandleSchema,
});
export type BreadcrumbHandle = z.infer<typeof breadcrumbHandleSchema>;

interface BreadcrumbsOptions {
  skip?: number;
  minBreadcrumbs?: number;
}

export const useBreadcrumbs = (args?: BreadcrumbsOptions) => {
  const matches = useMatches();

  return matchesToBreadcrumbs(matches, args);
};

export const matchesToBreadcrumbs = (
  matches: UIMatch[],
  { skip = 0, minBreadcrumbs = 0 }: BreadcrumbsOptions = {},
) => {
  const rawBreadcrumbs = matchesToRawBreadcrumbs(matches);
  rawBreadcrumbs.splice(0, skip);

  const noBreadcrumbs = rawBreadcrumbs.length === 0;
  const notEnoughBreadcrumbs = rawBreadcrumbs.length < minBreadcrumbs;

  if (noBreadcrumbs || notEnoughBreadcrumbs) {
    return null;
  }

  return rawBreadcrumbs.map(({ id, pathname, breadcrumb }, index) => ({
    id,
    element:
      index === rawBreadcrumbs.length - 1 ? (
        breadcrumb
      ) : (
        <Link to={pathname}>{breadcrumb}</Link>
      ),
  }));
};

const matchesToRawBreadcrumbs = (matches: UIMatch[]) => {
  const rawBreadcrumbs = [];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]!;

    const result = breadcrumbMatchSchema.safeParse(match);

    if (!result.success) {
      continue;
    }

    rawBreadcrumbs.push({
      id: match.id,
      pathname: match.pathname,
      breadcrumb: result.data.handle.breadcrumb,
    });
  }

  return rawBreadcrumbs;
};
