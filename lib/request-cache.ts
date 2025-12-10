"use server"

import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const CACHE_PREFIX = "query_cache:"
const CACHE_TTL = 3600 // 1 hour in seconds

/**
 * Generate a cache key from query and model
 */
function getCacheKey(query: string, modelId: string): string {
  // Normalize query: lowercase, trim, remove extra spaces
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ")
  return `${CACHE_PREFIX}${modelId}:${normalized}`
}

/**
 * Get cached response for a query
 */
export async function getCachedResponse(query: string, modelId: string): Promise<any | null> {
  try {
    const key = getCacheKey(query, modelId)
    const cached = await redis.get(key)

    return cached
  } catch (error) {
    console.error("[Cache] Get error:", error)
    return null
  }
}

/**
 * Cache a response for a query
 */
export async function cacheResponse(query: string, modelId: string, response: any): Promise<void> {
  try {
    const key = getCacheKey(query, modelId)
    await redis.set(key, JSON.stringify(response), { ex: CACHE_TTL })
  } catch (error) {
    console.error("[Cache] Set error:", error)
  }
}

/**
 * Invalidate cache for a specific query
 */
export async function invalidateCache(query: string, modelId: string): Promise<void> {
  try {
    const key = getCacheKey(query, modelId)
    await redis.del(key)
  } catch (error) {
    console.error("[Cache] Invalidate error:", error)
  }
}

/**
 * Clear all cached queries
 */
export async function clearAllCache(): Promise<void> {
  try {
    // This is a simple implementation - for production you'd want to use SCAN
    console.warn("[Cache] Clear all cache not implemented for safety")
  } catch (error) {
    console.error("[Cache] Clear error:", error)
  }
}
