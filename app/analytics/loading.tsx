import { RefreshCw, BarChart3 } from "lucide-react"

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Monitor your RAG system performance</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading analytics data...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
