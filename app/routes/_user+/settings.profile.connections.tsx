import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card.tsx";
import {
  providerConfigs,
  ProviderNameSchema,
  type ProviderName,
  ProviderConnectionForm,
  providerNames as supportedProviderNames,
} from "#app/utils/connections.tsx";
import { useDoubleCheck } from "#app/utils/ui.ts";
import { json } from "@remix-run/node";
import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { StatusButton } from "#app/components/status-button.tsx";
import { Link as LinkIcon, Trash } from "lucide-react";
import { requireUserId } from "#app/utils/auth.server.ts";
import { db } from "#app/utils/db.server.ts";
import { resolveConnectionInfo } from "#app/utils/connections.server.ts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#app/components/ui/table.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#app/components/ui/tooltip.tsx";
import dayjs from "dayjs";
import { validateCSRF } from "#app/utils/csrf.server.ts";
import { connectionTable } from "#drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { without } from "ramda";
import type { SEOHandle } from "@nasa-gcn/remix-seo";
import type { BreadcrumbHandle } from "#app/utils/breadcrumb";

export const handle: SEOHandle & BreadcrumbHandle = {
  getSitemapEntries: () => null,
  breadcrumb: (
    <span className="flex items-center gap-x-2">
      <LinkIcon size={16} />
      Connections
    </span>
  ),
};

export const meta: MetaFunction = () => {
  return [
    { title: "Connections | nichtsam" },
    {
      name: "description",
      content: "Manage your connections of your account on nichtsam.com",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const connections = await getConnections(userId);

  return json({ connections });
}

type ActionArgs = {
  request: Request;
  formData: FormData;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const intent = formData.get("intent");

  switch (intent) {
    case INTENT_DELETE_CONNECTION: {
      return deleteConnection({ formData, request });
    }
    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
}

export default function ProfileConnections() {
  const data = useLoaderData<typeof loader>();
  const connectedProviderNames = data.connections.map((c) => c.providerName);
  const missingProviderNames = without(
    connectedProviderNames,
    supportedProviderNames,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-8">
        {data.connections.length > 0 && (
          <Table>
            <TableCaption>A list of your connections.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Connected At</TableHead>
                <TableHead className="w-12">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.connections.map((connection) => (
                <ConnectionRow key={connection.connectionId} {...connection} />
              ))}
            </TableBody>
          </Table>
        )}

        {missingProviderNames.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Connect with new platform
            </h4>
            {missingProviderNames.map((providerName) => (
              <ProviderConnectionForm
                key={providerName}
                providerName={providerName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConnectionRowProps {
  providerName: ProviderName;
  connectionId: string;
  connectionUserDisplayName: string;
  profileLink?: string | null;
  createdAtFormatted: string;
}
const ConnectionRow = ({
  connectionId,
  providerName,
  profileLink,
  connectionUserDisplayName,
  createdAtFormatted,
}: ConnectionRowProps) => {
  const providerIcon = providerConfigs[providerName].icon;
  const providerLabel = providerConfigs[providerName].label;
  const name = profileLink ? (
    <a href={profileLink} className="underline">
      {connectionUserDisplayName}
    </a>
  ) : (
    <span>{connectionUserDisplayName}</span>
  );

  return (
    <TableRow>
      <TableCell>
        <span className="inline-flex items-center gap-x-2">
          {providerIcon}
          {providerLabel}
        </span>
      </TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{createdAtFormatted}</TableCell>
      <TableCell className="text-right">
        <DeleteConnectionButton connectionId={connectionId} />
      </TableCell>
    </TableRow>
  );
};

const DeleteConnectionButton = ({ connectionId }: { connectionId: string }) => {
  const dc = useDoubleCheck();
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="POST">
      <AuthenticityTokenInput />
      <input name="connectionId" value={connectionId} hidden readOnly />
      <Tooltip>
        <TooltipTrigger asChild>
          <StatusButton
            {...dc.getButtonProps({
              type: "submit",
              name: "intent",
              value: INTENT_DELETE_CONNECTION,
            })}
            variant={dc.doubleCheck ? "destructive" : "ghost"}
            status={fetcher.state !== "idle" ? "pending" : "idle"}
          >
            {fetcher.state === "idle" && <Trash size={16} />}
          </StatusButton>
        </TooltipTrigger>
        <TooltipContent>Disconnect this account</TooltipContent>
      </Tooltip>
    </fetcher.Form>
  );
};

const getConnections = async (userId: string) => {
  const rawConnections = await db.query.connectionTable.findMany({
    where: (connections, { eq }) => eq(connections.user_id, userId),
    columns: {
      id: true,
      provider_id: true,
      provider_name: true,
      created_at: true,
    },
  });

  const connections: Array<{
    providerName: ProviderName;
    connectionId: string;
    connectionUserDisplayName: string;
    profileLink?: string | null;
    createdAtFormatted: string;
  }> = [];

  for (const connection of rawConnections) {
    const parsed = ProviderNameSchema.safeParse(connection.provider_name);
    if (!parsed.success) {
      continue;
    }

    const { data: providerName } = parsed;

    const connectionInfo = await resolveConnectionInfo({
      providerName: parsed.data,
      providerId: connection.provider_id,
    });

    connections.push({
      ...connectionInfo,
      providerName: providerName,
      connectionId: connection.id,
      createdAtFormatted: dayjs(connection.created_at).format(
        "MM/DD/YYYY HH:mm:ss Z",
      ),
    });
  }

  return connections;
};

const INTENT_DELETE_CONNECTION = "INTENT_DELETE_CONNECTION";

const deleteConnection = async ({ formData }: ActionArgs) => {
  const connectionId = formData.get("connectionId");
  if (typeof connectionId !== "string") {
    throw new Response("Invalid connectionId", { status: 400 });
  }

  await db.delete(connectionTable).where(eq(connectionTable.id, connectionId));

  return json({ status: "success" } as const);
};
