import type { ReactNode } from "react";
import { Section, Heading } from "@/components/section/index.tsx";

export interface SectionProps {
  title: string;
  children: ReactNode;
}
export const ComponentSection = ({ title, children }: SectionProps) => (
  <>
    <Section className="flex flex-col gap-4">
      <Heading className="text-2xl font-bold sm:text-4xl">{title}</Heading>
      {children}
    </Section>
  </>
);
