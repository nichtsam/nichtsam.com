import {
  SESSION_ID_KEY,
  authSessionStorage,
  getAuthSession,
  getSessionExpirationDate,
  getUserId,
  login,
} from "@/utils/auth.server.ts";
import {
  authenticator,
  connectionSessionStorage,
} from "@/utils/connections.server.ts";
import { ProviderNameSchema } from "@/utils/connections.tsx";
import { db } from "@/utils/db.server.ts";
import { destroySession, sleep } from "@/utils/misc.ts";
import { redirect, type DataFunctionArgs } from "@remix-run/node";
import { connectionTable, sessionTable } from "database/schema.ts";
import { onboardingCookie } from "@/utils/auth.onboarding.server.ts";

export const loader = async ({ request, params }: DataFunctionArgs) => {
  await sleep(2000);

  const providerName = ProviderNameSchema.parse(params.provider);

  const profile = await authenticator.authenticate(providerName, request, {
    failureRedirect: "/login",
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
      // TODO: connection already bound to user
      throw redirect("/already-bound");
    } else {
      // TODO: connection already bound to another user
      throw redirect("/already-taken");
    }
  }

  // * logged in, bind connection to user
  if (userId) {
    await db.insert(connectionTable).values({
      user_id: userId,
      provider_id: profile.id,
      provider_name: providerName,
    });

    // TODO: connection added
    throw redirect("/connection-added");
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
      headers: {
        "set-cookie": await authSessionStorage.commitSession(authSession),
      },
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

    await login({ request, userId: emailOwner.id });
  }

  // TODO: new user, get them onboard

  const headers = new Headers();

  headers.append(
    "set-cookie",
    await onboardingCookie.serialize({
      providerId: profile.id,
      providerName,
      profile: {
        email: profile.email,
        imageUrl: profile.imageUrl,
        displayName: profile.name,
        username: profile.username,
      },
    }),
  );

  headers.append(
    "set-cookie",
    await destroySession(connectionSessionStorage, request),
  );

  throw redirect("/onboarding", {
    headers,
  });
};
