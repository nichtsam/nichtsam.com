import type { PostMatter } from "./blog.server.ts";

export function getPostThumbnailAlt(matter: PostMatter) {
  return matter.thumbnailAlt ?? "Post thumbnail";
}
