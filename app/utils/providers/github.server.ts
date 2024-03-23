import { GitHubStrategy } from "remix-auth-socials";
import type { AuthProvider } from "./model.ts";
import { env } from "../env.server.ts";
import { z } from "zod";

// pick needed from here: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
const GithubUserSchema = z.object({ login: z.string() });
type GithubUser = z.infer<typeof GithubUserSchema>;
const getDisplayName = (user: GithubUser) => user.login;
const getProfileLink = (user: GithubUser) => `https://github.com/${user.login}`;

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

  async resolveConnectionInfo(providerId: string) {
    // TODO: cache this
    const response = await fetch(`https://api.github.com/user/${providerId}`);
    const rawJson = await response.json();
    const result = GithubUserSchema.safeParse(rawJson);

    if (!result.success) {
      return {
        connectionUserDisplayName: "Unknown" as const,
        profileLink: null,
      };
    }

    return {
      connectionUserDisplayName: getDisplayName(result.data),
      profileLink: getProfileLink(result.data),
    };
  }
}
