import type { HeadersFunction, V2_MetaFunction } from "@remix-run/node";
import { ButtonDemo } from "@/components/ui/demo/index.ts";
import { Heading, Section } from "@/components/section/index.tsx";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Style Guideline | nichtsam" },
    {
      name: "description",
      content: "Style Guideline of this website",
    },
  ];
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=3600",
  Vary: "Cookie",
});

export default function Index() {
  return (
    <div className="h-full w-full">
      <Section className="container mx-auto flex flex-col gap-4 p-9">
        <Heading className="text-3xl font-bold sm:text-5xl">
          UI Elements
        </Heading>

        <ButtonDemo />
      </Section>
    </div>
  );
}
