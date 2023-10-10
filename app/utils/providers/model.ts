import type { Strategy } from "remix-auth";

export type ProviderUser = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  imageUrl?: string;
};

export interface AuthProvider {
  getAuthStrategy(): Strategy<ProviderUser, never>;
}
