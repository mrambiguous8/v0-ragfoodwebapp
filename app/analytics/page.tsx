"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Zap,
  Search,
  Sparkles,
  ArrowLeft,
  Database,
  Activity,
  AlertTriangle,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface AnalyticsSummary {
  totalQueries: number
  queriesLast24h: number
  avgResponseTime: number
  successRate: number
  topCategories: { category: string; count: number }[]
  modelUsage: { model: string; count: number }[]
  recentQueries: { query: string; timestamp: string; id: string }[]
}

interface PerformanceMetric {
  searchLatency: number
  generationLatency: number
  totalLatency: number
  success: boolean
  errorType?: string
}

interface VectorDBStats {
  indexInfo: {
    vectorCount: number
    dimension: number
    similarityFunction: string
  } | null
  health: "healthy" | "degraded" | "error"
  lastChecked: string
}

interface AnalyticsData {
  success: boolean
  data: {
    summary: AnalyticsSummary
    performance: PerformanceMetric[]
    errors: Record<string, number>
    vectorDB: VectorDBStats
    dailyCounts: { date: string; count: number }[]
    generatedAt: string
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analytics")
      const json = await response.json()
      if (json.success) {
        setData(json)
      } else {
        setError(json.error || "Failed to fetch analytics")
      }
    } catch (err) {
      setError("Failed to connect to analytics service")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // Calculate performance averages
  const calcPerformanceAvg = (metrics: PerformanceMetric[]) => {
    if (!metrics || metrics.length === 0) return null
    const successful = metrics.filter(m => m.success)
    if (successful.length === 0) return null
    
    return {
      avgSearchLatency: successful.reduce((sum, m) => sum + m.searchLatency, 0) / successful.length,
      avgGenerationLatency: successful.reduce((sum, m) => sum + m.generationLatency, 0) / successful.length,
      avgTotalLatency: successful.reduce((sum, m) => sum + m.totalLatency, 0) / successful.length,
      minLatency: Math.min(...successful.map(m => m.totalLatency)),
      maxLatency: Math.max(...successful.map(m => m.totalLatency)),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={fetchAnalytics} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = data?.data.summary
  const performance = calcPerformanceAvg(data?.data.performance || [])
  const vectorDB = data?.data.vectorDB
  const errors = data?.data.errors || {}
  const dailyCounts = data?.data.dailyCounts || []
  const totalErrors = Object.values(errors).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Chat
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor your RAG system performance
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.totalQueries || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Queries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.queriesLast24h || 0}</p>
                  <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary?.successRate?.toFixed(1) || 100}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatLatency(performance?.avgTotalLatency || summary?.avgResponseTime || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vector Database Health */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="w-5 h-5 text-primary" />
                  Vector Database Status
                </CardTitle>
                <CardDescription>Upstash Vector index health and statistics</CardDescription>
              </div>
              <Link href="/admin/food-items">
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="w-4 h-4" />
                  Manage Items
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Activity className={`w-5 h-5 ${
                  vectorDB?.health === "healthy" ? "text-emerald-500" : 
                  vectorDB?.health === "degraded" ? "text-amber-500" : "text-destructive"
                }`} />
                <div>
                  <p className="text-sm font-medium">Health Status</p>
                  <Badge variant={
                    vectorDB?.health === "healthy" ? "default" : 
                    vectorDB?.health === "degraded" ? "secondary" : "destructive"
                  } className={
                    vectorDB?.health === "healthy" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                  }>
                    {vectorDB?.health || "Unknown"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vectors Stored</p>
                <p className="text-2xl font-bold">{vectorDB?.indexInfo?.vectorCount?.toLocaleString() || "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                <p className="text-2xl font-bold">{vectorDB?.indexInfo?.dimension || "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Similarity Function</p>
                <p className="text-lg font-semibold capitalize">{vectorDB?.indexInfo?.similarityFunction || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        {performance && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Breakdown
              </CardTitle>
              <CardDescription>Latency metrics for each stage of the RAG pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Search className="w-4 h-4 text-emerald-500" />
                    Vector Search
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((performance.avgSearchLatency / performance.avgTotalLatency) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatLatency(performance.avgSearchLatency)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    LLM Generation
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((performance.avgGenerationLatency / performance.avgTotalLatency) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatLatency(performance.avgGenerationLatency)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Total Response
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-full" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Min: {formatLatency(performance.minLatency)} / Max: {formatLatency(performance.maxLatency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Query Trend */}
        {dailyCounts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Query Trend (Last 7 Days)
              </CardTitle>
              <CardDescription>Daily query volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {dailyCounts.map((day, i) => {
                  const maxCount = Math.max(...dailyCounts.map(d => d.count), 1)
                  const height = (day.count / maxCount) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{day.count}</span>
                      <div 
                        className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${day.date}: ${day.count} queries`}
                      />
                      <span className="text-xs text-muted-foreground">{formatShortDate(day.date)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Categories</CardTitle>
              <CardDescription>What users are asking about</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.topCategories && summary.topCategories.length > 0 ? (
                <div className="space-y-3">
                  {summary.topCategories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(cat.count / summary.totalQueries) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No category data yet. Start asking questions!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Model Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Usage</CardTitle>
              <CardDescription>Which AI models are being used</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.modelUsage && summary.modelUsage.length > 0 ? (
                <div className="space-y-3">
                  {summary.modelUsage.map((model, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium font-mono">{model.model}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ 
                              width: `${(model.count / summary.totalQueries) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{model.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No model usage data yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Breakdown */}
        {totalErrors > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Error Breakdown
              </CardTitle>
              <CardDescription>Types of errors encountered ({totalErrors} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(errors).map(([type, count]) => (
                  <div key={type} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-mono text-destructive">{type}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Queries */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Recent Queries</CardTitle>
            <CardDescription>Latest questions asked by users</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recentQueries && summary.recentQueries.length > 0 ? (
              <div className="space-y-2">
                {summary.recentQueries.slice(0, 10).map((q, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-sm truncate flex-1 mr-4">{q.query}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(q.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No queries yet. Go back to the chat and ask some questions!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data powered by Upstash Redis • Last updated: {data?.data.generatedAt ? new Date(data.data.generatedAt).toLocaleString() : "N/A"}</p>
        </div>
      </div>
    </div>
  )
}
