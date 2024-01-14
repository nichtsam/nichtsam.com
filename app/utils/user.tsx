import type { loader as rootLoader } from "@/root.tsx";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button.tsx";
import type { SerializeFrom } from "@remix-run/node";

export const isUser = (
  user: unknown,
): user is SerializeFrom<typeof rootLoader>["user"] => {
  return (
    !!user &&
    typeof user === "object" &&
    "id" in user &&
    typeof user.id === "string"
  );
};

export const useOptionalUser = () => {
  const data = useRouteLoaderData<typeof rootLoader>("root");

  if (!data || !isUser(data.user)) {
    return null;
  }

  return data.user;
};

export const useUser = () => {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }

  return maybeUser;
};

export const LoginButton = () => (
  <Button asChild>
    <Link to="/login">Login</Link>
  </Button>
);
