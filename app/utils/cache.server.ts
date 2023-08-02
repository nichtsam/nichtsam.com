import type { CacheEntry } from "cachified";
import { lruCacheAdapter } from "cachified";
import { singleton } from "./singleton.server.ts";
import { LRUCache } from "lru-cache";

const lru = singleton(
  "lru-cache",
  () => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }),
);

export const lruCache = lruCacheAdapter(lru);
