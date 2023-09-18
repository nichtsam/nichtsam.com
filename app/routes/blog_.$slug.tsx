import { json } from "@remix-run/node";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBlogPost } from "@/utils/blog.server.ts";
import { useMdxComponent } from "@/utils/mdx.tsx";
import { compileMdxCached } from "@/utils/compile-mdx.server.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Blogs!",
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.slug) {
    throw new Error("params.slug is not defined");
  }

  const slug = params.slug;
  const { source, files } = await getBlogPost(slug);
  const bundledBlog = await compileMdxCached({
    slug,
    source,
    files,
  });

  if (!bundledBlog) {
    throw new Response(null, { status: 404 });
  }

  return json(
    { bundledBlog },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        Vary: "Cookie",
      },
    },
  );
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=3600",
  Vary: "Cookie",
});

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
