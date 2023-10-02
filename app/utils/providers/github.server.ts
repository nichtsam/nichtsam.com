import { GitHubStrategy } from "remix-auth-github";
import type { AuthProvider } from "./model.ts";
import { env } from "../env.server.ts";

export class GitHubProvider implements AuthProvider {
  getAuthStrategy() {
    return new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
      },
      async ({ profile }) => {
        const email = profile.emails[0]!.value.trim().toLowerCase();
        const username = profile.displayName;
        const imageUrl = profile.photos[0].value;

        return {
          email,
          id: profile.id,
          username,
          name: profile.name.givenName,
          imageUrl,
        };
      },
    );
  }
}
