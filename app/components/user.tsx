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

export const UserButton = () => {
  const maybeUser = useOptionalUser();

  if (maybeUser) {
    return <UserActions />;
  }

  return (
    <Button asChild>
      <Link to="login">Login</Link>
    </Button>
  );
};

export const UserActions = () => {
  const user = useUser();

  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={user.imageUrl}
              alt={`The image of ${
                user.name ?? user.username ?? `Owner of ${user.email}`
              }`}
            />
            <AvatarFallback>me</AvatarFallback>
          </Avatar>
          {user.name ?? user.username}
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
            <button type="submit">Log out</button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
