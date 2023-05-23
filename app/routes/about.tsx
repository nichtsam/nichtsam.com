import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "About" }];
};

export default function About() {
  return <h1 className="text-3xl font-bold underline">Hello About!</h1>;
}
