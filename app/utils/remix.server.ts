import type { HeadersArgs } from "@remix-run/node";
import type { CacheControl } from "cache-control-parser";
import cacheControl from "cache-control-parser";

export function pipeHeaders({
  parentHeaders,
  loaderHeaders,
  actionHeaders,
  errorHeaders,
}: HeadersArgs) {
  const headers = new Headers();

  // get the one that's actually in use
  let currentHeaders: Headers;
  if (errorHeaders !== undefined) {
    currentHeaders = errorHeaders;
  } else if (loaderHeaders.entries().next().done) {
    currentHeaders = actionHeaders;
  } else {
    currentHeaders = loaderHeaders;
  }

  // take in useful headers route loader/action
  // pass this point currentHeaders can be ignored
  const forwardHeaders = ["Cache-Control", "Vary", "Server-Timing"];
  for (const headerName of forwardHeaders) {
    const header = currentHeaders.get(headerName);
    if (header) {
      headers.set(headerName, header);
    }
  }

  headers.set(
    "Cache-Control",
    getConservativeCacheControl(
      parentHeaders.get("Cache-Control"),
      headers.get("Cache-Control"),
    ),
  );

  // append useful parent headers
  const inheritHeaders = ["Vary", "Server-Timing"];
  for (const headerName of inheritHeaders) {
    const header = parentHeaders.get(headerName);
    if (header) {
      headers.append(headerName, header);
    }
  }

  // fallback to parent headers if loader don't have
  const fallbackHeaders = ["Cache-Control", "Vary"];
  for (const headerName of fallbackHeaders) {
    if (headers.has(headerName)) {
      continue;
    }
    const fallbackHeader = parentHeaders.get(headerName);
    if (fallbackHeader) {
      headers.set(headerName, fallbackHeader);
    }
  }

  return headers;
}

function getConservativeCacheControl(
  ...cacheControlHeaders: Array<string | null>
): string {
  return cacheControl.stringify(
    cacheControlHeaders
      .filter(Boolean)
      .map((header) => cacheControl.parse(header))
      .reduce<CacheControl>((final, current) => {
        if (current.private) {
          final.private = true;
        }

        const finalMaxAge = final["max-age"];
        const currentMaxAge = current["max-age"];

        if (finalMaxAge !== undefined && currentMaxAge !== undefined) {
          final["max-age"] = Math.min(finalMaxAge, currentMaxAge);
        } else if (finalMaxAge === undefined) {
          final["max-age"] = currentMaxAge;
        }

        return final;
      }, {}),
  );
}
