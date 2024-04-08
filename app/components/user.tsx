import { Form, Link, useSubmit } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx";
import { Button } from "./ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { useOptionalUser, useUser } from "#app/utils/user.tsx";
import { useRef } from "react";
import { getUserImgSrc } from "#app/routes/resources+/user-images.$imageId.ts";
import { LogOut, User } from "lucide-react";
import { cn, useIsPending } from "#app/utils/ui.ts";

export const UserButton = () => {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    return (
      <Button asChild>
        <Link to="login">Login</Link>
      </Button>
    );
  }

  return <UserActions />;
};

export const UserActions = () => {
  const user = useUser();

  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  const isLoggingOut = useIsPending({ formAction: "/logout" });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button asChild variant="outline">
          <Link
            className="flex gap-x-2"
            to={`/settings/profile`}
            onClick={(e) => e.preventDefault()}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={getUserImgSrc(user.image?.id)}
                alt={`The image of ${user.display_name}`}
              />
              <AvatarFallback>me</AvatarFallback>
            </Avatar>
            {user.display_name}
          </Link>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            prefetch="intent"
            to={`/settings/profile`}
            className="flex items-center gap-x-2"
          >
            <User size={16} /> Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          onSelect={(event) => {
            event.preventDefault();
            submit(formRef.current);
          }}
        >
          <Form action="/logout" method="POST" ref={formRef}>
            <button
              type="submit"
              className={cn("flex items-center gap-x-2", {
                "animate-pulse": isLoggingOut,
              })}
            >
              <LogOut size={16} /> Log out
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
