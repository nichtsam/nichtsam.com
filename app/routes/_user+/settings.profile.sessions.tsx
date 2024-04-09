import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card.tsx";
import { useDoubleCheck } from "#app/utils/ui.ts";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { json } from "@remix-run/node";
import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { StatusButton } from "#app/components/status-button.tsx";
import { db } from "#app/utils/db.server.ts";
import { and, count, eq, not } from "drizzle-orm";
import { sessionTable } from "#drizzle/schema.ts";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { getAuthSession, requireUserId } from "#app/utils/auth/auth.server.ts";
import type { SEOHandle } from "@nasa-gcn/remix-seo";
import type { BreadcrumbHandle } from "#app/utils/breadcrumb";
import { Icon } from "#app/components/ui/icon";

export const handle: SEOHandle & BreadcrumbHandle = {
  getSitemapEntries: () => null,
  breadcrumb: (
    <span className="flex items-center gap-x-2">
      <Icon name="book-user">Sessions</Icon>
    </span>
  ),
};

export const meta: MetaFunction = () => {
  return [
    { title: "Sessions | nichtsam" },
    {
      name: "description",
      content: "Manage your sessions of your account on nichtsam.com",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { sessionId } = await getAuthSession(request);

  if (!sessionId) {
    throw new Response("Not authenticated", { status: 403 });
  }

  const sessionsCount = await getSessionsCount({ userId, sessionId });
  return json({ sessionsCount });
}

type ActionArgs = {
  request: Request;
  formData: FormData;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const intent = formData.get("intent");

  switch (intent) {
    case INTENT_SIGN_OUT_OTHER_SESSIONS: {
      return signOutOtherSessions({ formData, request });
    }
    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
}

export default function ProfileConnections() {
  const data = useLoaderData<typeof loader>();
  const otherSessionsCount = data.sessionsCount - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {otherSessionsCount ? (
          <SignOutOtherSessions otherSessionsCount={otherSessionsCount} />
        ) : (
          <p className="flex items-center gap-x-2">
            <Icon name="key-round">This is your only session</Icon>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const SignOutOtherSessions = ({
  otherSessionsCount,
}: {
  otherSessionsCount: number;
}) => {
  const fetcher = useFetcher<typeof action>();
  const dc = useDoubleCheck();
  return (
    <div>
      <p className="mb-2">
        {`You have ${otherSessionsCount} ${
          otherSessionsCount > 1 ? "sessions" : "session"
        } elsewhere.`}
      </p>
      <fetcher.Form method="POST">
        <AuthenticityTokenInput />
        <StatusButton
          {...dc.getButtonProps({
            type: "submit",
            name: "intent",
            value: INTENT_SIGN_OUT_OTHER_SESSIONS,
          })}
          variant={dc.doubleCheck ? "destructive" : "default"}
          status={fetcher.state !== "idle" ? "pending" : "idle"}
          className="flex items-center gap-x-2 transition-none"
        >
          <Icon name="log-out">
            {dc.doubleCheck ? "Are you sure?" : "Sign them out"}
          </Icon>
        </StatusButton>
      </fetcher.Form>
    </div>
  );
};

const getSessionsCount = async ({
  userId,
}: {
  userId: string;
  sessionId: string;
}) =>
  db
    .select({ count: count(sessionTable.id) })
    .from(sessionTable)
    .where(eq(sessionTable.user_id, userId))
    .then(([session]) => session?.count ?? 0);

const INTENT_SIGN_OUT_OTHER_SESSIONS = "INTENT_SIGN_OUT_OTHER_SESSIONS";

const signOutOtherSessions = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const { sessionId } = await getAuthSession(request);

  if (!sessionId) {
    throw new Response("Not authenticated", { status: 403 });
  }

  await db
    .delete(sessionTable)
    .where(
      and(
        eq(sessionTable.user_id, userId),
        not(eq(sessionTable.id, sessionId)),
      ),
    );

  return json({ status: "success" } as const);
};
