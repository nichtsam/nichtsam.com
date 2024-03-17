import getGrayMatter from "gray-matter";
import calculateReadingTime from "reading-time";

export function getMdxMeta(file: string) {
  const grayMatter = getGrayMatter(file);

  const readingTime = calculateReadingTime(grayMatter.content);

  return { readingTime, matter: grayMatter.data as Record<string, unknown> };
}
