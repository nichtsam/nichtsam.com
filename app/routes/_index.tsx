import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Index" }];
};

export default function Index() {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}
