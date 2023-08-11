import type { HeadersFunction, V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Home | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Home Page!",
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
      <section className="container mx-auto p-9">
        <h1 className="text-3xl font-bold sm:text-5xl">Samuel Jensen</h1>
        <p className="text-sm sm:text-lg">
          Hi there, I'm Sam.
          <br />
          You can call me Sam.
          <br />
          Oh and this is my website by the way.
        </p>
      </section>
    </div>
  );
}
