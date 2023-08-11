import type { HeadersFunction } from "@remix-run/node";

const sleep = (ms: number) =>
  new Promise<void>((res) => setTimeout(() => res(), ms));

// Borrowed from https://github.com/kentcdodds/kentcdodds.com/blob/main/app/utils/misc.tsx#L357-L382
const reuseUsefulLoaderHeaders: HeadersFunction = ({
  loaderHeaders,
  parentHeaders,
}) => {
  const headers = new Headers();

  const usefulHeaders = ["Cache-Control", "Vary"];
  for (const headerName of usefulHeaders) {
    if (loaderHeaders.has(headerName)) {
      headers.set(headerName, loaderHeaders.get(headerName)!);
    }
  }

  const useIfNotExistsHeaders = ["Cache-Control", "Vary"];
  for (const headerName of useIfNotExistsHeaders) {
    if (!headers.has(headerName) && parentHeaders.has(headerName)) {
      headers.set(headerName, parentHeaders.get(headerName)!);
    }
  }

  return headers;
};

export { sleep, reuseUsefulLoaderHeaders };
