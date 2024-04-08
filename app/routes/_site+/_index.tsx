import type { HeadersFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
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
    <section className="container py-9">
      <article className="prose dark:prose-invert lg:prose-xl">
        <h1>Samuel Jensen</h1>
        <p>
          Hi there, I'm Sam.
          <br />
          You can call me Sam.
          <br />
          Oh and this is my website by the way.
        </p>
      </article>
    </section>
  );
}
