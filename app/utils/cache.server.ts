import { type CacheEntry, lruCacheAdapter } from 'cachified'
import { LRUCache } from 'lru-cache'
import { singleton } from './singleton.server.ts'

const lru = singleton(
	'lru-cache',
	() => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }),
)

export const lruCache = lruCacheAdapter(lru)
