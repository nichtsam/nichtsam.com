import { remember } from '@epic-web/remember'
import { type CacheEntry, lruCacheAdapter } from 'cachified'
import { LRUCache } from 'lru-cache'

const lru = remember(
	'lru-cache',
	() => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }),
)

export const lruCache = lruCacheAdapter(lru)
