import { json, type HeadersFunction, type MetaFunction } from "@remix-run/node";
import { type PostInfo, getPostInfos } from "#app/utils/mdx/blog.server";
import { Link, useLoaderData } from "@remix-run/react";
import { pipeHeaders } from "#app/utils/remix.server";
import { ServerTiming } from "#app/utils/timings.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | nichtsam" },
    { name: "description", content: "nichtsam's blog" },
  ];
};

export const headers: HeadersFunction = pipeHeaders;

export const loader = async () => {
  const timing = new ServerTiming();

  timing.time("get posts", "Get posts");
  const posts = await getPostInfos();
  timing.timeEnd("get posts");

  return json(
    { posts },
    {
      headers: {
        "Cache-Control": "max-age=86400",
        "Server-Timing": timing.toString(),
      },
    },
  );
};

export default function Blog() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="container max-w-prose">
      <ul className="flex flex-col gap-y-4">
        {data.posts.map((post) => (
          <li key={post.slug}>
            <PostItem post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostItem({ post }: { post: PostInfo }) {
  return (
    <div>
      <Link
        to={post.slug}
        className="inline-block text-xl leading-tight underline-offset-4 hover:underline"
      >
        {post.meta.matter.title}
      </Link>
      <p className="text-muted-foreground">{post.meta.readingTime.text}</p>
    </div>
  );
}
