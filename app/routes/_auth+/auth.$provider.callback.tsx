import {
  SESSION_ID_KEY,
  authSessionStorage,
  getAuthSession,
  getSessionExpirationDate,
  getUserId,
  login,
} from "#app/utils/auth/auth.server.ts";
import {
  authenticator,
  connectionSessionStorage,
} from "#app/utils/auth/connections.server.ts";
import {
  ProviderNameSchema,
  providerConfigs,
} from "#app/utils/auth/connections.tsx";
import { db } from "#app/utils/db.server.ts";
import { combineHeaders, destroySession } from "#app/utils/request.server.ts";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { connectionTable, sessionTable } from "#drizzle/schema.ts";
import { onboardingCookie } from "#app/utils/auth/onboarding.server.ts";
import { redirectWithToast } from "#app/utils/toast.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const providerName = ProviderNameSchema.parse(params.provider);
  const label = providerConfigs[providerName].label;

  const authResult = await authenticator
    .authenticate(providerName, request, { throwOnError: true })
    .then(
      (data) => ({ success: true, data }) as const,
      (error) => ({ success: false, error }) as const,
    );

  if (!authResult.success) {
    console.error(authResult.error);

    throw redirect("/login");
  }

  const profile = authResult.data;

  const headers = new Headers({
    "set-cookie": await destroySession(connectionSessionStorage, request),
  });

  const existingConnection = await db.query.connectionTable.findFirst({
    where: (connections, { eq, and }) =>
      and(
        eq(connections.provider_name, providerName),
        eq(connections.provider_id, profile.id),
      ),
  });

  const userId = await getUserId(request);

  if (existingConnection && userId) {
    if (existingConnection.user_id === userId) {
      return redirectWithToast(
        "/settings/profile/connections",
        {
          title: "Already Connected",
          message: `Your "${profile.username}" ${label} account is already connected.`,
        },
        { headers },
      );
    } else {
      return redirectWithToast(
        "/settings/profile/connections",
        {
          type: "error",
          title: "Already Taken",
          message: `The "${profile.username}" ${label} account is already taken by another account.`,
        },
        { headers },
      );
    }
  }

  // * logged in, bind connection to user
  if (userId) {
    await db.insert(connectionTable).values({
      user_id: userId,
      provider_id: profile.id,
      provider_name: providerName,
    });

    return redirectWithToast(
      "/settings/profile/connections",
      {
        type: "success",
        title: "Connected",
        message: `Your "${profile.username}" ${label} account has been connected.`,
      },
      { headers },
    );
  }

  // * not logged in but connection bind to a user, login that user
  if (existingConnection) {
    const session = (
      await db
        .insert(sessionTable)
        .values({
          expiration_at: getSessionExpirationDate(),
          user_id: existingConnection.user_id,
        })
        .returning()
    )[0]!;

    const { authSession } = await getAuthSession(request);
    authSession.set(SESSION_ID_KEY, session.id);

    throw redirect("/", {
      headers: combineHeaders(headers, {
        "set-cookie": await authSessionStorage.commitSession(authSession),
      }),
    });
  }

  // * check if any user owns this connection's email, bind to that user and login
  const emailOwner = await db.query.userTable.findFirst({
    where: (userTable, { eq }) => eq(userTable.email, profile.email),
  });

  if (emailOwner) {
    await db.insert(connectionTable).values({
      provider_id: profile.id,
      provider_name: providerName,
      user_id: emailOwner.id,
    });

    await login({ request, userId: emailOwner.id, headers });
  }

  // TODO: new user, get them onboard

  throw redirect("/onboarding", {
    headers: combineHeaders(headers, {
      "set-cookie": await onboardingCookie.serialize({
        providerId: profile.id,
        providerName,
        profile: {
          email: profile.email,
          imageUrl: profile.imageUrl,
          displayName: profile.name,
          username: profile.username,
        },
      }),
    }),
  });
};
