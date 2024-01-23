import { Form, Link, useSubmit } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx";
import { Button } from "./ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { useOptionalUser, useUser } from "@/utils/user.tsx";
import { useRef } from "react";
import { getUserImgSrc } from "@/routes/resources.user-images.$imageId.ts";
import { LogOut } from "lucide-react";
import { useIsPending } from "@/utils/misc.ts";
import { cn } from "@/utils/ui.ts";

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
        <Button variant="outline" className="flex gap-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={getUserImgSrc(user.image?.id)}
              alt={`The image of ${user.display_name}`}
            />
            <AvatarFallback>me</AvatarFallback>
          </Avatar>
          {user.display_name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
