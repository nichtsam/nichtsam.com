import { StatusButton } from "@/components/status-button.tsx";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Form } from "@remix-run/react";
import { GitHubStrategyDefaultName } from "remix-auth-github";
import { z } from "zod";
import { useIsPending } from "./misc.ts";

export const GITHUB_PROVIDER_NAME = GitHubStrategyDefaultName;

export const providerNames = [GITHUB_PROVIDER_NAME] as const;
export const ProviderNameSchema = z.enum(providerNames);
export type ProviderName = z.infer<typeof ProviderNameSchema>;

export type ProviderConfig = {
  label: string;
  icon?: React.ReactNode;
};
export const providerConfigs: Record<ProviderName, ProviderConfig> = {
  [GITHUB_PROVIDER_NAME]: {
    label: "Github",
    icon: <GitHubLogoIcon className="inline-block" />,
  },
};

export const ProviderConnectionForm = ({
  providerName,
}: {
  providerName: ProviderName;
}) => {
  const formAction = `/auth/${providerName}`;

  const config = providerConfigs[providerName];
  const label = config.label;
  const icon = config.icon;

  const isPending = useIsPending({ formAction });

  return (
    <Form method="POST" action={formAction}>
      <StatusButton
        status={isPending ? "pending" : "idle"}
        type="submit"
        className="w-full"
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </StatusButton>
    </Form>
  );
};
