import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Article = GetTypeByName<typeof configuration, "articles">;
export declare const allArticles: Array<Article>;

export {};
