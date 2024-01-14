import { createCookie } from "@remix-run/node";
import { env } from "./env.server.ts";
import { unvariant } from "./misc.ts";
import { z } from "zod";
import { onboardingFormSchema } from "@/routes/_auth.onboarding.tsx";
import { createTypedCookie } from "remix-utils/typed-cookie";

export const onboardingCookie = createTypedCookie({
  cookie: createCookie("_onboarding", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: unvariant(env.NODE_ENV === "production", 60 * 10),
    secrets: env.SESSION_SECRET.split(","),
    secure: env.NODE_ENV === "production",
  }),
  schema: z
    .object({
      providerId: z.string(),
      providerName: z.string(),
      profile: z
        .object({ email: z.string().email() })
        .merge(onboardingFormSchema.omit({ rememberMe: true }).partial()),
    })
    .nullable(),
});
