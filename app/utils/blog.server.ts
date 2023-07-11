import type { ReadTimeResults } from "reading-time";
import calculateReadingTime from "reading-time";
import { existsSync, readFile, readdir, resolve, walk } from "./fs.server";
import parseFrontMatter from "front-matter";

const rootPath = resolve(__dirname, "../");
const contentDirPath = resolve(rootPath, "./content");
const blogDirPath = resolve(contentDirPath, "./blog");

export const statSlug = async (slug: string) => {
  const isDirectory = existsSync(resolve(blogDirPath, slug));

  let entryExtension: "md" | "mdx";

  if (isDirectory) {
    if (existsSync(resolve(blogDirPath, slug, "index.md"))) {
      entryExtension = "md";
    } else if (existsSync(resolve(blogDirPath, slug, "index.mdx"))) {
      entryExtension = "mdx";
    } else {
      throw new Error(`no such slug: '${slug}'`);
    }
  } else {
    if (existsSync(resolve(blogDirPath, `${slug}.md`))) {
      entryExtension = "md";
    } else if (existsSync(resolve(blogDirPath, `${slug}.mdx`))) {
      entryExtension = "mdx";
    } else {
      throw new Error(`no such slug: '${slug}'`);
    }
  }

  return {
    isDirectory,
    entryExtension,
  };
};

export const getBlogPost = async (slug: string) => {
  const { isDirectory, entryExtension } = await statSlug(slug);

  let source: string;
  let files: { [key: string]: string | Buffer } = {};

  if (!isDirectory) {
    const entryPath = resolve(blogDirPath, `${slug}.${entryExtension}`);
    source = await readFile(entryPath, "utf-8");
  } else {
    const dirPath = resolve(blogDirPath, slug);
    const entryPath = resolve(dirPath, `index.${entryExtension}`);

    source = await readFile(entryPath, "utf-8");

    files = (await walk(dirPath)).reduce<typeof files>((acc, cur) => {
      acc[cur.path] = cur.content;
      return acc;
    }, {});
  }

  return {
    source,
    files,
  };
};

type PostMeta = {
  slug: string;
  title: string;
  readingTime: ReadTimeResults;
};

export const getBlogPostsMeta = async () => {
  const blogDir = await readdir(blogDirPath, { withFileTypes: true });

  const getMeta = async (path: string) => {
    const file = await readFile(path, "utf-8");

    const frontMatter = parseFrontMatter(file);
    const { title } = frontMatter.attributes as { title: string };
    const readingTime = calculateReadingTime(file);

    return {
      title,
      readingTime,
    };
  };

  return (
    await Promise.all(
      blogDir
        .filter((dirent) => dirent.name !== "README.md")
        .map(async (dirent) => {
          try {
            const slug = dirent.name.replace(/\.mdx?/, "");
            const { isDirectory, entryExtension } = await statSlug(slug);

            if (!isDirectory) {
              const filePath = resolve(blogDirPath, dirent.name);
              const meta = await getMeta(filePath);

              return {
                slug,
                ...meta,
              };
            } else {
              const dirPath = resolve(blogDirPath, dirent.name);
              const entryPath = resolve(dirPath, `index.${entryExtension}`);
              const meta = await getMeta(entryPath);

              return {
                slug,
                ...meta,
              };
            }
          } catch (err) {
            console.error(
              `Error: corrupted blog post, skipping file or directory: '${dirent.name}'`,
            );
          }
        }),
    )
  ).filter((postMeta): postMeta is PostMeta => !!postMeta);
};
