import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import { rootPath } from "../path.server.ts";
import { getMdxEntry } from "./mdx.server.ts";
import { getMdxMeta } from "./mdx-meta.server.ts";
import { z } from "zod";
import type { ReadTimeResults } from "reading-time";
import dayjs from "dayjs";

export const ENTRY = "blog";
const blogDirPath = resolve(rootPath, "mdx", ENTRY);

export const matterSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedDate: z.date().transform((date) => dayjs(date).format("YYYY-MM-DD")),
  thumbnailId: z.string(),
  thumbnailAlt: z.string().optional(),
});
export type PostMatter = z.infer<typeof matterSchema>;

export type PostMeta = {
  readingTime: ReadTimeResults;
  matter: PostMatter;
};

export type PostInfo = {
  slug: string;
  meta: PostMeta;
};

export function getPostMeta(file: string): PostMeta {
  const { matter: rawMatter, ...restMeta } = getMdxMeta(file);
  const matter = matterSchema.parse(rawMatter);

  return {
    ...restMeta,
    matter,
  };
}

export async function getPostInfos(): Promise<Array<PostInfo>> {
  const dir = await readdir(blogDirPath, { withFileTypes: true });
  const postInfos: Array<PostInfo> = [];
  await Promise.all(
    dir.map(async (dirent) => {
      const slug = dirent.name.replace(/.mdx?$/, "");

      try {
        const entry = getMdxEntry("blog", slug);
        const file = await readFile(entry.mdxPath, "utf-8");
        const meta = getPostMeta(file);

        postInfos.push({
          slug,
          meta,
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error(
            `Error: skipping blog post with slug '${slug}', invalid frontMatter:`,
            err.flatten().fieldErrors,
          );
        } else if (err instanceof Error) {
          console.error(
            `Error: skipping blog post with slug '${slug}' => `,
            err.message,
          );
        } else {
          console.error("Error: corrupted blog post, ", err);
        }
      }
    }),
  );

  return postInfos;
}
