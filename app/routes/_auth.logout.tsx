import { logout } from "@/utils/auth.server.ts";
import type { DataFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return logout(request);
}

export async function action({ request }: DataFunctionArgs) {
  return logout(request);
}
