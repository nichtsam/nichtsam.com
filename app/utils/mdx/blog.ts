import type { PostMatter } from "./blog.server";

export function getPostThumbnailAlt(matter: PostMatter) {
  return matter.thumbnailAlt ?? "Post thumbnail";
}
