import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "../env.server.ts";
import type { ProviderName } from "./connections.tsx";
import { GitHubProvider } from "../providers/github.server.ts";
import type { AuthProvider, ProviderUser } from "../providers/model.ts";
import { Authenticator } from "remix-auth";
import { DiscordProvider } from "../providers/discord.server.ts";

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
  discord: new DiscordProvider(),
};

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage,
);

for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.getAuthStrategy(), providerName);
}

export function resolveConnectionInfo({
  providerId,
  providerName,
}: {
  providerName: ProviderName;
  providerId: string;
}) {
  return providers[providerName].resolveConnectionInfo(providerId);
}
