import {
    ChevronRightIcon,
    EnvelopeOpenIcon,
    ReloadIcon,
  } from "@radix-ui/react-icons";
  import { Button } from "../button.tsx";
  import { Card, CardContent } from "../card.tsx";
  import { ComponentSection } from "./shared/section.tsx";
  import { Heading, Section } from "@/components/section/index.tsx";
  import type { ReactNode } from "react";
  
  const buttons = [
    {
      label: "Primary",
      button: <Button variant="default">Button</Button>,
    },
    { label: "Secondary", button: <Button variant="secondary">Button</Button> },
    {
      label: "Destructive",
      button: <Button variant="destructive">Button</Button>,
    },
    { label: "Outline", button: <Button variant="outline">Button</Button> },
    { label: "Ghost", button: <Button variant="ghost">Button</Button> },
    { label: "Link", button: <Button variant="link">Button</Button> },
    {
      label: "Icon",
      button: (
        <Button variant="outline">
          <ChevronRightIcon />
        </Button>
      ),
    },
    {
      label: "With Icon",
      button: (
        <Button variant="outline">
          <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Login with Email
        </Button>
      ),
    },
    {
      label: "Loading",
      button: (
        <Button disabled>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ),
    },
  ];
  
  export const ButtonDemo = () => (
    <ComponentSection title="Button">
      <div className="flex flex-wrap gap-4">
        {buttons.map(({ label, button }) => (
          <VariantSection key={label} title={label}>
            <Card className="flex-1">
              <CardContent className="flex h-full w-full items-center justify-center p-9">
                {button}
              </CardContent>
            </Card>
          </VariantSection>
        ))}
      </div>
    </ComponentSection>
  );
  
  interface SectionProps {
    title: string;
    children: ReactNode;
  }
  const VariantSection = ({ title, children }: SectionProps) => (
    <>
      <Section className="flex min-h-[350px] w-full flex-col gap-4 lg:basis-[calc(50%-1rem)]">
        <Heading className="text-xl font-bold sm:text-3xl">{title}</Heading>
        {children}
      </Section>
    </>
  );
  