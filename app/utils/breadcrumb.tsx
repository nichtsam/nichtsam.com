import { Link, useMatches } from "@remix-run/react";
import { isValidElement, type ReactNode } from "react";
import { z } from "zod";

export const breadcrumbSchema = z.custom<
  Exclude<ReactNode, boolean | null | undefined>
>((data) => !!data && (isValidElement(data) || typeof data !== "object"));

export const breadcrumbHandleSchema = z.object({
  handle: z.object({ breadcrumb: breadcrumbSchema }),
});

export const useBreadcrumbs = (args?: {
  skip?: number;
  minCrumbs?: number;
}) => {
  const { skip = 0, minCrumbs = 0 } = args ?? {};

  const matches = useMatches();

  const breadcrumbs = [];

  for (let i = skip; i < matches.length; i += 1) {
    const match = matches[i]!;

    const result = breadcrumbHandleSchema.safeParse(match);
    if (!result.success) {
      continue;
    }

    breadcrumbs.push({
      id: match.id,
      element:
        i === matches.length - 1 ? (
          result.data.handle.breadcrumb
        ) : (
          <Link to={match.pathname}>{result.data.handle.breadcrumb}</Link>
        ),
    });
  }

  if (breadcrumbs.length < minCrumbs) {
    return null;
  }

  return breadcrumbs;
};
