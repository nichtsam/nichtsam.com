import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { useUser } from "@/utils/user.tsx";
import { Outlet } from "@remix-run/react";
import { getUserImgSrc } from "./resources.user-images.$imageId.ts";
import { useBreadcrumbs } from "@/utils/breadcrumb.tsx";
import { ChevronRight, User } from "lucide-react";
import { cn } from "@/utils/ui.ts";
import { unvariant } from "@/utils/misc.ts";
import { requireUserId } from "@/utils/auth.server.ts";
import type { DataFunctionArgs } from "@remix-run/node";

export const handle = {
  breadcrumb: (
    <span className="flex items-center gap-x-2">
      <User size={16} />
      Profile
    </span>
  ),
};

export const loader = async ({ request }: DataFunctionArgs) => {
  await requireUserId(request);

  return null;
};

export default function SettingProfile() {
  return (
    <div className="container flex flex-col gap-y-8 py-4">
      <UserHeader />

      <Breadcrumbs />

      <Outlet />
    </div>
  );
}

const UserHeader = () => {
  const user = useUser();

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-40 w-40">
        <AvatarImage src={getUserImgSrc(user.image?.id)} />
        <AvatarFallback>me</AvatarFallback>
      </Avatar>
      <div className="text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {user.display_name}
        </h1>
        <p className="text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString("en")}
        </p>
      </div>
    </div>
  );
};

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs({ minCrumbs: 2 });

  if (!breadcrumbs) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-x-3">
      {breadcrumbs.map(({ id, element }, i, arr) => (
        <li
          key={id}
          className={cn("flex items-center gap-x-3", {
            "text-muted-foreground": i < arr.length - 1,
          })}
        >
          {unvariant(i !== 0, <ChevronRight size={16} />)}
          {element}
        </li>
      ))}
    </ul>
  );
};
