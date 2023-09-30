import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { json } from "@remix-run/node";
import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { NavLink } from "@/components/link.tsx";
import { getBlogPostsMeta } from "@/utils/blog.server.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! Blogs!",
    },
  ];
};

export const loader = async () => {
  const blogPosts = await getBlogPostsMeta();

  return json(
    { blogPosts },
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

export default function Blog() {
  const { blogPosts } = useLoaderData<typeof loader>();
  return (
    <div className="container py-9">
      <section className="prose dark:prose-invert lg:prose-xl">
        <h1>Blog</h1>
        <NavigationMenu.Root>
          <NavigationMenu.List>
            {blogPosts.map((post) => (
              <NavigationMenu.Item key={post.slug}>
                <p>
                  <NavLink prefetch="intent" to={`./${post.slug}`}>
                    {post.title}
                  </NavLink>
                  <br />
                  <span>- {post.readingTime.text}</span>
                </p>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </section>
    </div>
  );
}
