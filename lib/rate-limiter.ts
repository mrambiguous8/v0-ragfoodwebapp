"use server"

import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limiter using sliding window algorithm
 * @param identifier - IP address or user ID
 * @param limit - Max requests per window
 * @param window - Time window in seconds
 */
export async function rateLimit(identifier: string, limit = 10, window = 60): Promise<RateLimitResult> {
  try {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - window * 1000

    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Get the oldest request in the window to calculate reset time
      const oldestRequests = await redis.zrange(key, 0, 0, { withScores: true })
      const oldestTimestamp = oldestRequests.length > 0 ? Number(oldestRequests[0].score) : now
      const reset = Math.ceil((oldestTimestamp + window * 1000) / 1000)

      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` })

    // Set expiry on the key
    await redis.expire(key, window)

    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      reset: Math.ceil((now + window * 1000) / 1000),
    }
  } catch (error) {
    console.error("[RateLimit] Error:", error)
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Math.ceil((Date.now() + window * 1000) / 1000),
    }
  }
}

/**
 * Check if an IP or identifier is blocked
 */
export async function isBlocked(identifier: string): Promise<boolean> {
  try {
    const blockKey = `blocked:${identifier}`
    const blocked = await redis.get(blockKey)
    return blocked !== null
  } catch (error) {
    console.error("[RateLimit] Block check error:", error)
    return false
  }
}

/**
 * Block an IP or identifier for a duration
 */
export async function blockIdentifier(identifier: string, durationSeconds = 3600): Promise<void> {
  try {
    const blockKey = `blocked:${identifier}`
    await redis.set(blockKey, "1", { ex: durationSeconds })
  } catch (error) {
    console.error("[RateLimit] Block error:", error)
  }
}
