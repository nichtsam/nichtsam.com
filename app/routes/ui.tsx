import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { Heading, Section } from "@/components/section/index.tsx";
import CardsDemo from "@/components/ui/demo/cards/index.tsx";
import { Button } from "@/components/ui/button.tsx";

export const meta: MetaFunction = () => {
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
        <p>
          This page is for the purpose of testing out
          <Button asChild variant="link">
            <a href="https://ui.shadcn.com/themes">`@shadcn/ui` themes</a>
          </Button>
          .
        </p>

        <CardsDemo />
      </Section>
    </div>
  );
}
