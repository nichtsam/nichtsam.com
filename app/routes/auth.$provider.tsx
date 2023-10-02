import {
  GeneralErrorBoundary,
  generalNotFoundHandler,
} from "@/components/error-boundary.tsx";
import { authenticator } from "@/utils/auth.server.ts";
import { ProviderNameSchema } from "@/utils/connections.tsx";
import { sleep } from "@/utils/misc.ts";
import type { DataFunctionArgs } from "@remix-run/node";

export const action = async ({ request, params }: DataFunctionArgs) => {
  await sleep(2000);

  const providerName = ProviderNameSchema.parse(params.provider);

  return await authenticator.authenticate(providerName, request);
};

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: generalNotFoundHandler,
      }}
    />
  );
}
