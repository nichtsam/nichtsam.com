import { Authenticator } from "remix-auth";
import type { ProviderUser } from "./providers/model.ts";
import { connectionSessionStorage, providers } from "./connections.server.ts";
import { combineHeaders } from "./misc.ts";
import { redirectBack } from "remix-utils/redirect-back";

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage,
);

for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.getAuthStrategy(), providerName);
}

export async function requireAnonymous(request: Request) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export const logout = async (request: Request, responseInit?: ResponseInit) => {
  const session = await connectionSessionStorage.getSession(
    request.headers.get("cookie"),
  );

  throw redirectBack(request, {
    ...responseInit,
    headers: combineHeaders(
      {
        "set-cookie": await connectionSessionStorage.destroySession(session),
      },
      responseInit?.headers,
    ),
    fallback: "/",
  });
};
