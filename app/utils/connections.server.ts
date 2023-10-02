import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "./env.server.ts";
import type { ProviderName } from "./connections.tsx";
import { GitHubProvider } from "./providers/github.server.ts";
import type { AuthProvider } from "./providers/model.ts";

export const connectionSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_connection",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

export const providers: Record<ProviderName, AuthProvider> = {
  github: new GitHubProvider(),
};
