import type { Cookie, SessionStorage } from "@remix-run/node";

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

const getDomainUrl = (request: Request) => {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
};

export {
  combineHeaders,
  getCookieHeader,
  destroyCookie,
  getSession,
  destroySession,
  getDomainUrl,
};
