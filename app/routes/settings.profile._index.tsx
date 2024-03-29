import {
  redirect,
  type DataFunctionArgs,
  type HeadersFunction,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { Trash } from "lucide-react";
import { StatusButton } from "#app/components/status-button.tsx";
import { useDoubleCheck } from "#app/utils/misc.ts";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "#app/components/ui/navigation-menu.tsx";
import {
  authSessionStorage,
  getAuthSession,
  requireUserId,
} from "#app/utils/auth.server.ts";
import { db } from "#app/utils/db.server.ts";
import { userTable } from "#drizzle/schema.ts";
import { eq } from "drizzle-orm";

export const meta: MetaFunction = () => {
  return [
    { title: "Profile | nichtsam" },
    {
      name: "description",
      content: "Your profile setting page on nichtsam.com",
    },
  ];
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=3600",
  Vary: "Cookie",
});

const INTENT_DELETE_ACCOUNT = "INTENT_DELETE_ACCOUNT";

export const action = async ({ request }: DataFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const intent = formData.get("intent");

  switch (intent) {
    case INTENT_DELETE_ACCOUNT: {
      return deleteAccount({ userId, request });
    }
    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
};

export default function SettingProfile() {
  return (
    <div className="flex flex-col items-center gap-y-8">
      <NavigationMenu>
        <NavigationMenuList className="flex-col gap-y-1">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                prefetch="intent"
                to="connections"
                className={navigationMenuTriggerStyle()}
              >
                Manage Connections
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                prefetch="intent"
                to="sessions"
                className={navigationMenuTriggerStyle()}
              >
                Check Sessions
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <DeleteAccount />
    </div>
  );
}

const DeleteAccount = () => {
  const fetcher = useFetcher<typeof deleteAccount>();
  const dc = useDoubleCheck();

  return (
    <fetcher.Form method="POST">
      <AuthenticityTokenInput />
      <StatusButton
        {...dc.getButtonProps({
          type: "submit",
          name: "intent",
          value: INTENT_DELETE_ACCOUNT,
        })}
        variant={dc.doubleCheck ? "destructive" : "default"}
        status={fetcher.state !== "idle" ? "pending" : "idle"}
        className="flex gap-2 transition-none"
      >
        <Trash size={16} />
        {dc.doubleCheck ? "Are you sure?" : "Delete My Account"}
      </StatusButton>
    </fetcher.Form>
  );
};

const deleteAccount = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  await db.delete(userTable).where(eq(userTable.id, userId));
  const { authSession } = await getAuthSession(request);

  return redirect("/", {
    headers: {
      "set-cookie": await authSessionStorage.destroySession(authSession),
    },
  });
};
