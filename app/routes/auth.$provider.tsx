import {
  GeneralErrorBoundary,
  generalNotFoundHandler,
} from "@/components/error-boundary.tsx";
import { authenticator } from "@/utils/connections.server.ts";
import { ProviderNameSchema } from "@/utils/connections.tsx";
import type { DataFunctionArgs } from "@remix-run/node";

export const action = async ({ request, params }: DataFunctionArgs) => {
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
