import { createCookie, redirect } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { env } from "./env.server";
import { z } from "zod";
import type { toast } from "sonner";
import { nanoid } from "nanoid";
import {
  combineHeaders,
  destroyCookie,
  getCookieHeader,
} from "./request.server";

const toastSchema = z
  .object({
    id: z.string().default(() => nanoid()),
    title: z.string().optional(),
    message: z.string(),
    type: z
      .enum(["message", "success", "error"] as const satisfies Array<
        keyof typeof toast
      >)
      .default("message"),
  })
  .nullable();

export type Toast = z.infer<typeof toastSchema>;
export type ToastInput = NonNullable<z.input<typeof toastSchema>>;

export const toastCookie = createTypedCookie({
  cookie: createCookie("_toast", {
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: env.SESSION_SECRET.split(","),
    secure: env.NODE_ENV === "production",
  }),
  schema: toastSchema,
});

export async function redirectWithToast(
  url: string,
  toast: ToastInput,
  init?: ResponseInit,
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
  });
}

export async function createToastHeaders(toastInput: ToastInput) {
  const cookie = await toastCookie.serialize(toastInput);
  return new Headers({ "set-cookie": cookie });
}

export async function getToast(request: Request) {
  const toast = await toastCookie.parse(getCookieHeader(request));

  if (!toast) {
    return null;
  }

  return {
    toast,
    discardHeaders: new Headers({
      "set-cookie": await destroyCookie(toastCookie),
    }),
  };
}
