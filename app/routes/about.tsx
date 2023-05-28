import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "About | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! About Page!",
    },
  ];
};

export default function About() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-3xl font-bold">
        Hello! here should be some introduction of myself.
      </h1>
    </div>
  );
}
