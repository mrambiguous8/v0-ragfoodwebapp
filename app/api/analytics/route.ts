import { NextResponse } from "next/server"
import { getAnalyticsSummary, getPerformanceMetrics, getErrorBreakdown, getVectorDBStats, getDailyQueryCounts } from "@/lib/analytics"

/**
 * Analytics API Endpoint
 * GET /api/analytics - Returns analytics summary and performance metrics
 * 
 * Query params:
 * - days: number of days for daily breakdown (default: 7)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7", 10)

    const [summary, performance, errors, vectorDB, dailyCounts] = await Promise.all([
      getAnalyticsSummary(),
      getPerformanceMetrics(),
      getErrorBreakdown(),
      getVectorDBStats(),
      getDailyQueryCounts(days),
    ])

    return NextResponse.json({
      success: true,
      data: {
        summary,
        performance,
        errors,
        vectorDB,
        dailyCounts,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    )
  }
}
