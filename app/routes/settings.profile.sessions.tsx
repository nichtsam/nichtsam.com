import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useDoubleCheck } from "@/utils/misc.ts";
import { BookUser, KeyRound, LogOut } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { json } from "@remix-run/node";
import type {
  MetaFunction,
  ActionFunctionArgs,
  DataFunctionArgs,
} from "@remix-run/node";
import { StatusButton } from "@/components/status-button.tsx";
import { db } from "@/utils/db.server.ts";
import { and, count, eq, not } from "drizzle-orm";
import { sessionTable } from "database/schema.ts";
import { validateCSRF } from "@/utils/csrf.server.ts";
import { getAuthSession, requireUserId } from "@/utils/auth.server.ts";

export const handle = {
  breadcrumb: (
    <span className="flex items-center gap-x-2">
      <BookUser size={16} />
      Sessions
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

export async function loader({ request }: DataFunctionArgs) {
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
            <KeyRound size={16} />
            This is your only session
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
          <LogOut size={16} />
          {dc.doubleCheck ? "Are you sure?" : "Sign them out"}
        </StatusButton>
      </fetcher.Form>
    </div>
  );
};

const getSessionsCount = async ({
  userId,
  sessionId,
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
