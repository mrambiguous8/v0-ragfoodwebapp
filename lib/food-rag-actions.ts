"use server"

import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import type { SearchResult, UpstashVectorResult } from "@/types"
import { DEFAULT_MODEL, type ModelId } from "@/lib/models"
import { trackQuery, trackResponse } from "@/lib/analytics"
import { validateEnv } from "@/lib/env-validator"

let envConfig: ReturnType<typeof validateEnv> | null = null
try {
  envConfig = validateEnv()
} catch (error) {
  console.error("[RAG] Environment validation failed:", error)
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Response with metrics for analytics
export interface RAGResponse {
  text: string
  searchResults: SearchResult[]
  metrics: {
    searchLatency: number
    generationLatency: number
    totalLatency: number
    searchResultsCount: number
  }
}

export async function searchKnowledgeBase(query: string): Promise<{ results: SearchResult[]; latency: number }> {
  const startTime = Date.now()

  try {
    if (!envConfig) {
      throw new Error("Service not properly configured. Please contact support.")
    }

    const upstashUrl = envConfig.UPSTASH_VECTOR_REST_URL
    const upstashToken = envConfig.UPSTASH_VECTOR_REST_TOKEN

    // Use query-data endpoint for indexes with built-in embeddings
    const response = await fetch(`${upstashUrl}/query-data`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: query,
        topK: 3,
        includeMetadata: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Vector search failed: ${response.statusText}`)
    }

    const data = await response.json()
    // Handle both array response and object with result property
    const upstashResults = (Array.isArray(data) ? data : data.result || []) as UpstashVectorResult[]

    const searchResults: SearchResult[] = upstashResults.map((result) => ({
      id: result.id,
      title: result.metadata?.name || "Food Item",
      content: result.metadata?.text || "",
      relevance: Math.min(result.score, 1),
      category: result.metadata?.category,
      origin: result.metadata?.origin,
    }))

    const latency = Math.round(Date.now() - startTime)
    return { results: searchResults, latency }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to search knowledge base")
  }
}

export async function generateResponse(
  userMessage: string,
  searchResults: SearchResult[],
  modelId: ModelId = DEFAULT_MODEL,
): Promise<{ text: string; latency: number }> {
  const startTime = Date.now()

  try {
    if (!envConfig) {
      throw new Error("Service not properly configured. Please contact support.")
    }

    const context =
      searchResults.length > 0
        ? `Knowledge Base Results:\n${searchResults
            .map(
              (result) => `- ${result.title} (relevance: ${Math.round(result.relevance * 100)}%)\n  ${result.content}`,
            )
            .join("\n\n")}`
        : "No relevant documents found in the knowledge base."

    const systemPrompt = `You are a knowledgeable food and cooking expert assistant. You have access to a knowledge base about various foods, recipes, and cooking techniques. Use the provided context to answer questions accurately and helpfully. If the knowledge base doesn't have relevant information, let the user know. Always cite what you found in the knowledge base when applicable.`

    const fullPrompt = `Knowledge Base Context:\n${context}\n\nUser Question: ${userMessage}`

    // 70B model needs more time, use longer timeout
    const is70B = modelId.includes("70b")

    const { text } = await generateText({
      model: groq(modelId),
      system: systemPrompt,
      prompt: fullPrompt,
      temperature: 0.7,
      // @ts-expect-error - maxTokens is a valid option but types may be outdated
      maxTokens: is70B ? 800 : 1024, // Slightly shorter for 70B to avoid timeouts
    })

    const latency = Math.round(Date.now() - startTime)
    return { text, latency }
  } catch (error) {
    console.error("[RAG] Generation error:", error)

    if (error instanceof Error) {
      // Check for specific Groq errors
      const errorMessage = error.message.toLowerCase()

      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again, or switch to the 8B model.")
      }
      if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
        throw new Error(
          "Request timed out. The 70B model may be under heavy load. Try the 8B model for faster responses.",
        )
      }
      if (errorMessage.includes("503") || errorMessage.includes("service unavailable")) {
        throw new Error("Groq service is temporarily unavailable. Please try again in a moment.")
      }

      throw new Error(`Failed to generate response: ${error.message}`)
    }
    throw new Error("Failed to generate response")
  }
}

/**
 * Combined RAG query with analytics tracking
 */
export async function processRAGQuery(query: string, modelId: ModelId = DEFAULT_MODEL): Promise<RAGResponse> {
  const totalStartTime = performance.now()
  let queryId = ""
  let searchLatency = 0
  let generationLatency = 0
  let searchResultsCount = 0
  let searchResults: SearchResult[] = []

  try {
    // Track query start
    const category = detectCategory(query)
    queryId = await trackQuery(query, modelId, category)

    // Search
    const searchResult = await searchKnowledgeBase(query)
    searchLatency = searchResult.latency
    searchResults = searchResult.results
    searchResultsCount = searchResults.length

    // Generate response
    const genResult = await generateResponse(query, searchResults, modelId)
    generationLatency = genResult.latency

    const totalLatency = Math.round(performance.now() - totalStartTime)

    // Track successful response
    await trackResponse({
      queryId,
      searchLatency,
      generationLatency,
      totalLatency,
      searchResultsCount,
      responseLength: genResult.text.length,
      success: true,
    })

    return {
      text: genResult.text,
      searchResults,
      metrics: {
        searchLatency,
        generationLatency,
        totalLatency,
        searchResultsCount,
      },
    }
  } catch (error) {
    const totalLatency = Math.round(performance.now() - totalStartTime)

    // Track failed response
    await trackResponse({
      queryId,
      searchLatency,
      generationLatency,
      totalLatency,
      searchResultsCount,
      responseLength: 0,
      success: false,
      errorType: error instanceof Error ? error.name : "unknown",
    })

    throw error
  }
}

/**
 * Simple category detection from query
 */
function detectCategory(query: string): string | undefined {
  const lowerQuery = query.toLowerCase()

  const categories: Record<string, string[]> = {
    Breakfast: ["breakfast", "morning", "brunch", "eggs", "pancake", "waffle"],
    Lunch: ["lunch", "sandwich", "salad", "midday"],
    Dinner: ["dinner", "supper", "evening meal"],
    Dessert: ["dessert", "sweet", "cake", "cookie", "ice cream", "chocolate"],
    Vegetarian: ["vegetarian", "veggie", "meatless", "plant-based"],
    Healthy: ["healthy", "low calorie", "nutritious", "diet", "light"],
    "Quick Meals": ["quick", "fast", "10 minute", "15 minute", "easy", "simple"],
    Grilling: ["grill", "bbq", "barbecue", "smoke"],
    Soup: ["soup", "stew", "broth", "chowder"],
    Salad: ["salad", "greens", "fresh"],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return category
    }
  }

  return undefined
}
