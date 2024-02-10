import type { Cookie, HeadersFunction, SessionStorage } from "@remix-run/node";
import { useFormAction, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { useSpinDelay } from "spin-delay";

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

export const ERROR_FALL_BACK_MESSAGE = "Unknown Error";
const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  console.error("Unable to get error message for error", error);
  return ERROR_FALL_BACK_MESSAGE;
};

const combineHeaders = (
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) => {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
};

const useIsPending = ({
  formAction,
  formMethod = "POST",
  state = "non-idle",
}: {
  formAction?: string;
  formMethod?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  state?: "submitting" | "loading" | "non-idle";
} = {}) => {
  const contextualFormAction = useFormAction();
  const navigation = useNavigation();
  const isPendingState =
    state === "non-idle"
      ? navigation.state !== "idle"
      : navigation.state === state;

  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  );
};

const useDelayedIsPending = ({
  formAction,
  formMethod,
  delay = 400,
  minDuration = 300,
}: Parameters<typeof useIsPending>[0] &
  Parameters<typeof useSpinDelay>[1] = {}) => {
  const isPending = useIsPending({ formAction, formMethod });
  const delayedIsPending = useSpinDelay(isPending, {
    delay,
    minDuration,
  });
  return delayedIsPending;
};

export const generateCallAll = <Args extends Array<unknown>>(
  ...fns: Array<((...arg: Args) => unknown) | null | undefined>
) => {
  return (...arg: Args) => fns.forEach((fn) => fn?.(...arg));
};

export function useDoubleCheck() {
  const [doubleCheck, setDoubleCheck] = useState(false);

  function getButtonProps(
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>,
  ) {
    const onBlur: React.ButtonHTMLAttributes<HTMLButtonElement>["onBlur"] =
      () => setDoubleCheck(false);

    const onClick: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"] =
      doubleCheck
        ? undefined
        : (e) => {
            e.preventDefault();
            setDoubleCheck(true);
          };

    const onKeyUp: React.ButtonHTMLAttributes<HTMLButtonElement>["onKeyUp"] = (
      e,
    ) => {
      if (e.key === "Escape") {
        setDoubleCheck(false);
      }
    };

    return {
      ...props,
      onBlur: generateCallAll(onBlur, props?.onBlur),
      onClick: generateCallAll(onClick, props?.onClick),
      onKeyUp: generateCallAll(onKeyUp, props?.onKeyUp),
    };
  }

  return { doubleCheck, getButtonProps };
}

const unvariant = <T>(bool: boolean, value: T) => (bool ? value : undefined);

export async function downloadFile(
  url: string,
  retries: number = 0,
  max_retries: number = 3,
) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image with status ${response.status}`);
    }

    // contentType fallback : https://www.rfc-editor.org/rfc/rfc9110.html#section-8.3-5
    const contentType =
      response.headers.get("content-type") ?? "application/octet-stream";
    const blob = Buffer.from(await response.arrayBuffer());

    return { contentType, blob };
  } catch (e) {
    if (retries > max_retries) throw e;
    return downloadFile(url, retries + 1, max_retries);
  }
}

const getCookieHeader = (request: Request) => {
  return request.headers.get("cookie");
};

const destroyCookie = (cookie: Cookie) => {
  return cookie.serialize(null, { expires: new Date(Date.now() - 1) });
};

const getSession = (storage: SessionStorage, request: Request) => {
  const cookieHeader = getCookieHeader(request);
  const session = storage.getSession(cookieHeader);

  return session;
};

const destroySession = async (storage: SessionStorage, request: Request) => {
  const session = await getSession(storage, request);
  return storage.destroySession(session);
};

export {
  sleep,
  reuseUsefulLoaderHeaders,
  getErrorMessage,
  combineHeaders,
  useIsPending,
  useDelayedIsPending,
  unvariant,
  getCookieHeader,
  destroyCookie,
  getSession,
  destroySession,
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type { Prettify };
