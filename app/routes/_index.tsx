import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Home | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Home Page!",
    },
  ];
};

export default function Index() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-3xl font-bold">Hello! This is Soydev.</h1>
    </div>
  );
}
