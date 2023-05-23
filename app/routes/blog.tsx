import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Blog" }];
};

export default function Blog() {
  return <h1 className="text-3xl font-bold underline">Hello Blog!</h1>;
}
