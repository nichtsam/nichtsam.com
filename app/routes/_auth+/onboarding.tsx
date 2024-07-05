import { ErrorList, Field } from "#app/components/forms.tsx";
import { StatusButton } from "#app/components/status-button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card.tsx";
import {
  SESSION_ID_KEY,
  authSessionStorage,
  getAuthSession,
  requireAnonymous,
  signUpWithConnection,
} from "#app/utils/auth/auth.server.ts";
import { db } from "#app/utils/db.server.ts";
import { destroyCookie } from "#app/utils/request.server.ts";
import { useIsPending } from "#app/utils/ui.ts";
import { onboardingCookie } from "#app/utils/auth/onboarding.server.ts";
import type { SubmissionResult } from "@conform-to/react";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { SEOHandle } from "@nasa-gcn/remix-seo";
import { onboardingFormSchema } from "#app/utils/auth/onboarding.ts";

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
};

const requireData = async (request: Request) => {
  await requireAnonymous(request);

  const onboardingInfo = await onboardingCookie.parse(
    request.headers.get("cookie"),
  );

  if (onboardingInfo) {
    return onboardingInfo;
  } else {
    throw redirect("/login");
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { profile } = await requireData(request);

  const prefill = profile;

  return json({
    email: profile.email,
    prefillResult: {
      initialValue: prefill,
      error: {},
    } satisfies SubmissionResult,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { providerId, providerName, profile } = await requireData(request);
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: onboardingFormSchema
      .refine(
        async (data) => {
          const existingUser = await db.query.userTable.findFirst({
            where: (userTable, { eq }) => eq(userTable.username, data.username),
          });

          return !existingUser;
        },
        {
          message: "A user already exists with this username :(",
          path: ["username"],
        },
      )
      .transform(async ({ displayName, username, imageUrl, rememberMe }) => {
        const session = await signUpWithConnection({
          connection: {
            provider_id: providerId,
            provider_name: providerName,
          },
          user: {
            email: profile.email,
            username,
            display_name: displayName,
            imageUrl,
          },
        });
        return { session, rememberMe };
      }),
    async: true,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { session, rememberMe } = submission.value;

  const { authSession } = await getAuthSession(request);
  authSession.set(SESSION_ID_KEY, session.id);

  const headers = new Headers();

  headers.append("set-cookie", await destroyCookie(onboardingCookie));
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: rememberMe ? session.expiration_at : undefined,
    }),
  );

  throw redirect("/", {
    headers,
  });
};

export default function OnBoarding() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "onboarding-provider-form",
    constraint: getZodConstraint(onboardingFormSchema),
    lastResult: actionData?.result ?? data.prefillResult,
    shouldRevalidate: "onBlur",
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: onboardingFormSchema }),
  });

  return (
    <div className="container max-w-lg md:mt-10 lg:max-w-3xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-6xl lg:text-7xl">
            Hey there!
          </CardTitle>
          <CardDescription className="text-lg md:text-2xl lg:text-3xl">
            Tell us about you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" {...getFormProps(form)}>
            {fields.imageUrl.initialValue ? (
              <div className="mb-8 flex flex-col items-center justify-start gap-2">
                <img
                  src={fields.imageUrl.initialValue}
                  alt={`avatar of you`}
                  className="h-24 w-24 rounded-full"
                />
                <p className="text-sm text-muted-foreground">
                  You can change this later.
                </p>

                <input
                  {...getInputProps(fields.imageUrl, { type: "hidden" })}
                />
              </div>
            ) : null}
            <div className="text-sm">
              <p className="font-medium leading-none">Email</p>
              <p className="overflow-x-auto font-light">{data.email}</p>
            </div>
            <Field
              labelProps={{ children: "How should we call you?" }}
              inputProps={{
                ...getInputProps(fields.displayName, { type: "text" }),
                autoComplete: "name",
              }}
              errors={fields.displayName.errors}
              help="Name for display purpose."
            />
            <Field
              labelProps={{ children: "Choose a username!" }}
              inputProps={{
                ...getInputProps(fields.username, { type: "text" }),
                autoComplete: "username",
                className: "lowercase",
              }}
              errors={fields.username.errors}
              help="A unique identifier for your account."
            />

            {/* TODO Remember Me Checkbox */}

            <ErrorList errorId={form.errorId} errors={form.errors} />
            <StatusButton
              type="submit"
              className="mt-6 w-full"
              status={isPending ? "pending" : form.status ?? "idle"}
              disabled={isPending}
            >
              Go onboard!
            </StatusButton>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
