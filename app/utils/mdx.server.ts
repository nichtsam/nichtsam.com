import { bundleMDX as innerBundleMDX } from "mdx-bundler";
import remarkMdxImages from "remark-mdx-images";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { resolve } from "./fs.server";
import calculateReadingTime from "reading-time";

const root = resolve(__dirname, "../");
const publicDir = resolve(root, "./public");

export interface BundleMdx {
  source: string;
  files: Record<string, string | Buffer>;
}

export const bundleMdx = async ({ source, files }: BundleMdx) => {
  const { code, frontmatter } = await innerBundleMDX({
    source,
    // ! some files are Buffers, it works but the type disallow it. ignore for now.
    // @ts-ignore
    files,
    mdxOptions: (options) => {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkMdxImages,
      ];

      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ];

      return options;
    },
    esbuildOptions: (options) => {
      options.loader = {
        ...options.loader,
        ".webp": "file",
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".gif": "file",
      };
      options.outdir = resolve(publicDir, "./build/generated/assets");
      options.publicPath = "/build/generated/assets";
      options.write = true;

      return options;
    },
  });

  const readingTime = calculateReadingTime(source);

  return {
    code,
    frontmatter,
    readingTime,
  };
};