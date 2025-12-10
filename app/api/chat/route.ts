import { type NextRequest, NextResponse } from "next/server"
import { processRAGQuery } from "@/lib/food-rag-actions"
import type { ModelId } from "@/lib/models"
import { rateLimit, isBlocked } from "@/lib/rate-limiter"
import { validateInput, validateModelId, getClientIP } from "@/lib/input-validator"
import { getCachedResponse, cacheResponse } from "@/lib/request-cache"

/**
 * POST /api/chat
 *
 * RAG Query API endpoint for programmatic access (testing, integrations)
 *
 * Request body:
 * {
 *   "query": string,       // The user's question
 *   "modelId"?: string     // Optional: "llama-3.1-8b-instant" or "llama-3.3-70b-versatile"
 * }
 *
 * Response:
 * {
 *   "text": string,        // Generated response
 *   "searchResults": [...], // Retrieved documents
 *   "metrics": {
 *     "searchLatency": number,     // ms
 *     "generationLatency": number, // ms
 *     "totalLatency": number,      // ms
 *     "searchResultsCount": number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const clientIP = getClientIP(request.headers)

    if (await isBlocked(clientIP)) {
      return NextResponse.json({ error: "Too many requests. Your IP has been temporarily blocked." }, { status: 429 })
    }

    const rateLimitResult = await rateLimit(clientIP, 10, 60)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.max(0, rateLimitResult.reset - Math.floor(Date.now() / 1000)).toString(),
          },
        },
      )
    }

    const body = await request.json()

    const { query, modelId = "llama-3.1-8b-instant" } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'query' parameter" }, { status: 400 })
    }

    const validation = validateInput(query, {
      maxLength: 1000,
      minLength: 1,
      allowHTML: false,
      checkPromptInjection: true,
    })

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error || "Invalid input" }, { status: 400 })
    }

    if (!validateModelId(modelId)) {
      return NextResponse.json(
        { error: "Invalid model ID. Must be 'llama-3.1-8b-instant' or 'llama-3.3-70b-versatile'" },
        { status: 400 },
      )
    }

    const cached = await getCachedResponse(validation.sanitized, modelId as ModelId)
    if (cached) {
      const parsedCache = typeof cached === "string" ? JSON.parse(cached) : cached
      return NextResponse.json(
        {
          ...parsedCache,
          cached: true,
          metrics: {
            ...parsedCache.metrics,
            totalLatency: Date.now() - startTime,
          },
        },
        {
          headers: {
            "X-Cache": "HIT",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      )
    }

    const result = await processRAGQuery(validation.sanitized, modelId as ModelId)

    await cacheResponse(validation.sanitized, modelId as ModelId, {
      text: result.text,
      searchResults: result.searchResults,
      metrics: result.metrics,
    })

    return NextResponse.json(
      {
        text: result.text,
        searchResults: result.searchResults,
        metrics: result.metrics,
        cached: false,
      },
      {
        headers: {
          "X-Cache": "MISS",
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      },
    )
  } catch (error) {
    console.error("[API /chat] Error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * GET /api/chat
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/chat",
    method: "POST",
    description: "RAG Food Knowledge Base Query API",
    usage: {
      query: "string (required) - Your food-related question",
      modelId: "string (optional) - 'llama-3.1-8b-instant' or 'llama-3.3-70b-versatile'",
    },
  })
}
