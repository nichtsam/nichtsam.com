import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Blog | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Blogs!",
    },
  ];
};

export default function Blog() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <article>
        <h1 className="text-3xl font-bold">
          Hello! here should be the blogs of mine.
        </h1>
        <p>
          The blogs would be loaded with the help of `mdx-bundler` and
          `@octokit/rest`.
        </p>
      </article>
    </div>
  );
}
