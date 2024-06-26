import { json, type HeadersFunction, type MetaFunction } from "@remix-run/node";
import { type PostInfo, getPostInfos } from "#app/utils/mdx/blog.server";
import { getPostThumbnailAlt } from "#app/utils/mdx/blog";
import { Link, useLoaderData } from "@remix-run/react";
import { AspectRatio } from "#app/components/ui/aspect-ratio";
import { CloudinaryImage } from "#app/components/image";
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
    <div className="container">
      <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostCard({ post }: { post: PostInfo }) {
  return (
    <Link to={post.slug}>
      <div className="group">
        <div className="transition-transform duration-500 group-hover:-translate-y-3 group-hover:scale-105">
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted-foreground"
          >
            <CloudinaryImage
              id={post.meta.matter.thumbnailId}
              alt={getPostThumbnailAlt(post.meta.matter)}
              className="h-full w-full object-cover"
              sizes={[
                "(min-width: 1400px) 385px",
                "(min-width: 1024px) 33vw",
                "(min-width: 640px) 50vw",
                "100vw",
              ]}
              widths={[320, 640, 960, 1280]}
            />
          </AspectRatio>
        </div>

        <div className="mt-2 transition duration-500 group-hover:-translate-y-2">
          <div className="mx-0 flex items-center justify-between transition-[margin] duration-500 group-hover:mx-7">
            <p className="text-sm text-muted-foreground">
              {post.meta.readingTime.text}
            </p>
            <p className="text-sm text-muted-foreground">
              {post.meta.matter.publishedDate}
            </p>
          </div>

          <h3 className="font-bold leading-tight transition-all duration-500 group-hover:ml-7">
            {post.meta.matter.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
