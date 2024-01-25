import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { requireAnonymous } from "@/utils/auth.server.ts";
import { ProviderConnectionForm, providerNames } from "@/utils/connections.tsx";
import type {
  DataFunctionArgs,
  HeadersFunction,
  MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Login | nichtsam" },
    {
      name: "description",
      content: "Login to nichtsam.com",
    },
  ];
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=3600",
  Vary: "Cookie",
});

export async function loader({ request }: DataFunctionArgs) {
  await requireAnonymous(request);

  return null;
}

export default function Login() {
  return (
    <div className="container max-w-lg md:mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Choose your path</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-y-2">
            {providerNames.map((providerName) => (
              <li key={providerName}>
                <ProviderConnectionForm providerName={providerName} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
