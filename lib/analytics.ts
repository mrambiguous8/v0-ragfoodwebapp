"use server"

import { Redis } from "@upstash/redis"

// Initialize Redis client
let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } else {
    console.warn("[Analytics] Redis not configured - analytics will be disabled")
  }
} catch (error) {
  console.error("[Analytics] Failed to initialize Redis:", error)
  redis = null
}

// Keys for different analytics data
const KEYS = {
  queries: "analytics:queries",
  queryCount: "analytics:query_count",
  categoryCount: "analytics:categories",
  modelUsage: "analytics:models",
  responseMetrics: "analytics:response_metrics",
  errors: "analytics:errors",
  dailyQueries: (date: string) => `analytics:daily:${date}`,
}

// Types
export interface QueryEvent {
  id: string
  query: string
  model: string
  timestamp: string
  category?: string
}

export interface ResponseMetrics {
  queryId: string
  searchLatency: number
  generationLatency: number
  totalLatency: number
  searchResultsCount: number
  responseLength: number
  success: boolean
  errorType?: string
}

export interface AnalyticsSummary {
  totalQueries: number
  queriesLast24h: number
  avgResponseTime: number
  successRate: number
  topCategories: { category: string; count: number }[]
  modelUsage: { model: string; count: number }[]
  recentQueries: QueryEvent[]
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get today's date string
function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Track a new query
 */
export async function trackQuery(query: string, model: string, category?: string): Promise<string> {
  const queryId = generateId()

  if (!redis) {
    console.warn("[Analytics] Redis not available, skipping query tracking")
    return queryId
  }

  const event: QueryEvent = {
    id: queryId,
    query,
    model,
    timestamp: new Date().toISOString(),
    category,
  }

  try {
    // Store query event (keep last 1000)
    await redis.lpush(KEYS.queries, JSON.stringify(event))
    await redis.ltrim(KEYS.queries, 0, 999)

    // Increment total count
    await redis.incr(KEYS.queryCount)

    // Increment daily count
    await redis.incr(KEYS.dailyQueries(getTodayKey()))
    await redis.expire(KEYS.dailyQueries(getTodayKey()), 86400 * 7) // 7 days TTL

    // Track model usage
    await redis.hincrby(KEYS.modelUsage, model, 1)

    // Track category if provided
    if (category) {
      await redis.hincrby(KEYS.categoryCount, category, 1)
    }

    return queryId
  } catch (error) {
    console.error("[Analytics] Failed to track query:", error)
    return queryId // Return ID anyway for response tracking
  }
}

/**
 * Track response metrics
 */
export async function trackResponse(metrics: ResponseMetrics): Promise<void> {
  if (!redis) {
    console.warn("[Analytics] Redis not available, skipping response tracking")
    return
  }

  try {
    // Store metrics (keep last 1000)
    await redis.lpush(KEYS.responseMetrics, JSON.stringify(metrics))
    await redis.ltrim(KEYS.responseMetrics, 0, 999)

    // Track errors separately if failed
    if (!metrics.success && metrics.errorType) {
      await redis.hincrby(KEYS.errors, metrics.errorType, 1)
    }
  } catch (error) {
    console.error("[Analytics] Failed to track response:", error)
  }
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    // Get total queries
    const totalQueries = (await redis?.get<number>(KEYS.queryCount)) || 0

    // Get today's queries
    const queriesLast24h = (await redis?.get<number>(KEYS.dailyQueries(getTodayKey()))) || 0

    // Get recent queries
    const recentQueriesRaw = await redis?.lrange<string>(KEYS.queries, 0, 9)
    const recentQueries: QueryEvent[] = recentQueriesRaw?.map((q) => (typeof q === "string" ? JSON.parse(q) : q)) || []

    // Get recent metrics for avg response time and success rate
    const metricsRaw = await redis?.lrange<string>(KEYS.responseMetrics, 0, 99)
    const metrics: ResponseMetrics[] = metricsRaw?.map((m) => (typeof m === "string" ? JSON.parse(m) : m)) || []

    const avgResponseTime =
      metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.totalLatency, 0) / metrics.length) : 0

    const successRate =
      metrics.length > 0 ? Math.round((metrics.filter((m) => m.success).length / metrics.length) * 100) : 100

    // Get category counts
    const categoryData = (await redis?.hgetall<Record<string, number>>(KEYS.categoryCount)) || {}
    const topCategories = Object.entries(categoryData)
      .map(([category, count]) => ({ category, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get model usage
    const modelData = (await redis?.hgetall<Record<string, number>>(KEYS.modelUsage)) || {}
    const modelUsage = Object.entries(modelData)
      .map(([model, count]) => ({ model, count: Number(count) }))
      .sort((a, b) => b.count - a.count)

    return {
      totalQueries,
      queriesLast24h,
      avgResponseTime,
      successRate,
      topCategories,
      modelUsage,
      recentQueries,
    }
  } catch (error) {
    console.error("[Analytics] Failed to get summary:", error)
    return {
      totalQueries: 0,
      queriesLast24h: 0,
      avgResponseTime: 0,
      successRate: 100,
      topCategories: [],
      modelUsage: [],
      recentQueries: [],
    }
  }
}

/**
 * Get performance metrics for the last N queries
 */
export async function getPerformanceMetrics(limit = 50): Promise<ResponseMetrics[]> {
  try {
    const metricsRaw = await redis?.lrange<string>(KEYS.responseMetrics, 0, limit - 1)
    return metricsRaw?.map((m) => (typeof m === "string" ? JSON.parse(m) : m)) || []
  } catch (error) {
    console.error("[Analytics] Failed to get performance metrics:", error)
    return []
  }
}

/**
 * Get error breakdown by type
 */
export async function getErrorBreakdown(): Promise<Record<string, number>> {
  try {
    const errors = await redis?.hgetall<Record<string, number>>(KEYS.errors)
    return errors || {}
  } catch (error) {
    console.error("[Analytics] Failed to get error breakdown:", error)
    return {}
  }
}

/**
 * Get Vector Database statistics
 */
export async function getVectorDBStats(): Promise<{
  indexInfo: {
    vectorCount: number
    dimension: number
    similarityFunction: string
  } | null
  health: "healthy" | "degraded" | "error"
  lastChecked: string
}> {
  try {
    const upstashUrl = process.env.UPSTASH_VECTOR_REST_URL
    const upstashToken = process.env.UPSTASH_VECTOR_REST_TOKEN

    if (!upstashUrl || !upstashToken) {
      return {
        indexInfo: null,
        health: "error",
        lastChecked: new Date().toISOString(),
      }
    }

    // Get index info from Upstash Vector
    const response = await fetch(`${upstashUrl}/info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })

    if (!response.ok) {
      return {
        indexInfo: null,
        health: "error",
        lastChecked: new Date().toISOString(),
      }
    }

    const data = await response.json()
    const result = data.result || data

    return {
      indexInfo: {
        vectorCount: result.vectorCount || result.vector_count || 0,
        dimension: result.dimension || 0,
        similarityFunction: result.similarityFunction || result.similarity_function || "cosine",
      },
      health: "healthy",
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[Analytics] Failed to get vector DB stats:", error)
    return {
      indexInfo: null,
      health: "error",
      lastChecked: new Date().toISOString(),
    }
  }
}

/**
 * Get daily query counts for the past N days
 */
export async function getDailyQueryCounts(days = 7): Promise<{ date: string; count: number }[]> {
  try {
    const results: { date: string; count: number }[] = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      const count = (await redis?.get<number>(KEYS.dailyQueries(dateKey))) || 0
      results.push({ date: dateKey, count })
    }

    return results.reverse() // Oldest first
  } catch (error) {
    console.error("[Analytics] Failed to get daily counts:", error)
    return []
  }
}
