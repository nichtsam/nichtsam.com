import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBlogPost } from "~/utils/blog.server";
import { useMdxComponent } from "~/utils/mdx";
import { bundleMdx } from "~/utils/mdx.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Blog | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Blogs!",
    },
  ];
};

export const loader = async ({ params }: LoaderArgs) => {
  if (!params.slug) {
    throw new Error("params.slug is not defined");
  }

  const slug = params.slug;
  const { source, files } = await getBlogPost(slug);
  const bundledBlog = await bundleMdx({
    source,
    files,
  });

  return { bundledBlog };
};

export default function BlogPost() {
  const { bundledBlog } = useLoaderData<typeof loader>();
  const Component = useMdxComponent(bundledBlog.code);

  return (
    <div className="flex h-full w-full justify-center">
      <article className="prose px-4 dark:prose-invert">
        <p>{bundledBlog.readingTime.text}</p>
        <Component />
      </article>
    </div>
  );
}
