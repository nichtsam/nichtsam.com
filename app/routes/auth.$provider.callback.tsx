import { authenticator } from "@/utils/auth.server.ts";
import { ProviderNameSchema } from "@/utils/connections.tsx";
import { sleep } from "@/utils/misc.ts";
import type { DataFunctionArgs } from "@remix-run/node";

export const loader = async ({ request, params }: DataFunctionArgs) => {
  await sleep(2000);

  const providerName = ProviderNameSchema.parse(params.provider);

  return authenticator.authenticate(providerName, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
