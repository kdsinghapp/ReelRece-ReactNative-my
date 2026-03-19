/**
 * Offline Response Cache for GET requests
 *
 * - Caches successful GET responses in memory
 * - When a GET request fails due to network error, serves cached response if available
 * - Cache TTL: 5 minutes (stale data better than no data when offline)
 * - Max entries: 30
 */

import type { AxiosResponse } from 'axios';
import TokenService from '@services/TokenService';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 30;

interface CacheEntry {
  data: AxiosResponse;
  createdAt: number;
}

const cache = new Map<string, CacheEntry>();

function getUserIdentifier(): string {
  const token = TokenService.getTokenSync();
  if (!token) return 'anon';
  return token.length > 8 ? token.slice(-8) : token;
}

function buildCacheKey(config: { url?: string; params?: object; method?: string }): string {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const userId = getUserIdentifier();
  let paramsStr = '';
  if (config.params && typeof config.params === 'object') {
    const sorted = Object.keys(config.params).sort().reduce((acc, k) => {
      acc[k] = (config.params as Record<string, unknown>)[k];
      return acc;
    }, {} as Record<string, unknown>);
    paramsStr = JSON.stringify(sorted);
  }
  return `${userId}:${method}:${url}:${paramsStr}`;
}

function evictOldest(): void {
  if (cache.size < MAX_CACHE_ENTRIES) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  for (const [key, entry] of cache) {
    if (entry.createdAt < oldestTime) {
      oldestTime = entry.createdAt;
      oldestKey = key;
    }
  }
  if (oldestKey) cache.delete(oldestKey);
}

/** Cache a successful GET/HEAD response */
export function cacheResponse(config: { url?: string; params?: object; method?: string }, response: AxiosResponse): void {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get' && method !== 'head') return;

  const key = buildCacheKey(config);
  evictOldest();
  cache.set(key, { data: response, createdAt: Date.now() });
}

/** Clear the entire response cache (call on logout / account switch). */
export function clearResponseCache(): void {
  cache.clear();
}

/** Get cached response if available and not expired. Returns null if miss or stale. */
export function getCachedResponse(config: { url?: string; params?: object; method?: string }): AxiosResponse | null {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get' && method !== 'head') return null;

  const key = buildCacheKey(config);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}
