import { bundleMDX as _bundleMDX } from "mdx-bundler";
import type { MdxBundleSource } from "./mdx.server";
import PQueue from "p-queue";
import { singleton } from "../singleton.server";
import { lruCache } from "../cache.server";
import { cachified } from "cachified";

async function bundleMDX({ source, files }: MdxBundleSource) {
  const mdxBundle = await _bundleMDX({
    source,
    files,
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? [])];
      options.rehypePlugins = [...(options.rehypePlugins ?? [])];
      return options;
    },
  });

  return {
    code: mdxBundle.code,
  };
}

const queue = singleton(
  "compile-mdx-queue",
  () =>
    new PQueue({
      concurrency: 1,
      throwOnTimeout: true,
      timeout: 1000 * 30,
    }),
);

const queuedBundleMDX = async (...args: Parameters<typeof bundleMDX>) =>
  await queue.add(() => bundleMDX(...args), { throwOnTimeout: true });

const cachedBundleMDX = ({
  slug,
  bundle,
}: {
  slug: string;
  bundle: MdxBundleSource;
}) => {
  const key = `${slug}:compiled`;
  const compileMdx = cachified({
    key,
    cache: lruCache,
    getFreshValue: () => queuedBundleMDX(bundle),
  });

  return compileMdx;
};

export { cachedBundleMDX as bundleMDX };
