"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SearchResult } from "@/types"
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Tag, Globe, X, ExternalLink, UtensilsCrossed, ChefHat, Leaf, ScrollText, Apple } from "lucide-react"

// Parse structured content into labeled sections
function parseContent(content: string): { label: string; value: string; icon?: typeof BookOpen }[] {
  const sections: { label: string; value: string; icon?: typeof BookOpen }[] = []
  
  const patterns = [
    { regex: /Name:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Name", icon: UtensilsCrossed },
    { regex: /Category:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Category", icon: Tag },
    { regex: /Origin:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Origin", icon: Globe },
    { regex: /Description:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Description", icon: ScrollText },
    { regex: /Ingredients:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Ingredients", icon: Apple },
    { regex: /Preparation:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Preparation", icon: ChefHat },
    { regex: /Nutritional Highlights:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Nutritional Highlights", icon: Leaf },
    { regex: /Cultural Significance:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Cultural Significance", icon: Globe },
    { regex: /Dietary Classifications:\s*(.+?)(?=\n[A-Z]|$)/s, label: "Dietary Classifications", icon: Leaf },
  ]

  for (const { regex, label, icon } of patterns) {
    const match = content.match(regex)
    if (match && match[1]) {
      sections.push({ label, value: match[1].trim(), icon })
    }
  }

  // If no patterns matched, return raw content
  if (sections.length === 0) {
    return [{ label: "Content", value: content }]
  }

  return sections
}

// Extract description from structured content for preview
function getPreviewText(content: string): string {
  const descMatch = content.match(/Description:\s*(.+?)(?=\n[A-Z][a-z]+:|$)/s)
  if (descMatch && descMatch[1]) {
    return descMatch[1].trim()
  }
  // Fallback: return first sentence or truncated content
  const firstSentence = content.split(/[.!?]/)[0]
  return firstSentence ? firstSentence.trim() : content.substring(0, 150)
}

interface SearchResultsProps {
  results: SearchResult[]
  onTagClick?: (query: string) => void
}

export function SearchResults({ results, onTagClick }: SearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null)

  if (results.length === 0) return null

  return (
    <>
      <div className="border border-border/50 rounded-xl bg-gradient-to-br from-secondary/30 to-background overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="sources-panel"
          title="Click to expand/collapse the sources used to generate this response"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Sources Used</h3>
            <Badge variant="secondary" className="text-xs px-2 py-0.5" title={`${results.length} documents retrieved from vector database`}>
              {results.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs hidden sm:inline">Evidence for this answer</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          id="sources-panel"
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[500px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 pb-4 space-y-3">
            {/* Explanation text */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/30">
              <Sparkles className="w-3 h-3 text-accent" />
              Click on a source to read the full content.
            </p>

            {/* Results Grid */}
            <div className="grid gap-3">
              {results.map((result, index) => (
                <Card
                  key={result.id}
                  onClick={() => setSelectedSource(result)}
                  className="p-4 border border-border/50 bg-card/50 hover:bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedSource(result)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        #{index + 1}
                      </span>
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {result.title}
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <Badge
                      variant="outline"
                      title={`Relevance score: ${Math.round(result.relevance * 100)}% - Higher scores indicate better semantic match`}
                      className={`shrink-0 text-xs gap-1 font-semibold ${
                        result.relevance >= 0.8
                          ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                          : result.relevance >= 0.5
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {Math.round(result.relevance * 100)}% match
                    </Badge>
                  </div>

                  {/* Metadata Tags */}
                  {(result.category || result.origin) && (
                    <div className="flex items-center gap-2 mb-2 pl-8">
                      {result.category && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTagClick?.(`Show me more ${result.category} recipes`)
                          }}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                          title={`Search for more ${result.category} recipes`}
                        >
                          <Tag className="w-3 h-3" />
                          {result.category}
                        </button>
                      )}
                      {result.origin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onTagClick?.(`Show me ${result.origin} cuisine recipes`)
                          }}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                          title={`Search for more ${result.origin} cuisine`}
                        >
                          <Globe className="w-3 h-3" />
                          {result.origin}
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2 pl-8 leading-relaxed">
                    {getPreviewText(result.content)}
                  </p>
                  <p className="text-xs text-primary/70 pl-8 mt-1 group-hover:text-primary transition-colors">
                    Click to read more →
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Content Modal */}
      {selectedSource && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSource(null)}
        >
          <div 
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 border-b border-border bg-secondary/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground truncate">
                    {selectedSource.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      selectedSource.relevance >= 0.8
                        ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                        : selectedSource.relevance >= 0.5
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {Math.round(selectedSource.relevance * 100)}% match
                  </Badge>
                  {selectedSource.category && (
                    <button
                      onClick={() => {
                        setSelectedSource(null)
                        onTagClick?.(`Show me more ${selectedSource.category} recipes`)
                      }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      title={`Search for more ${selectedSource.category} recipes`}
                    >
                      <Tag className="w-3 h-3" />
                      {selectedSource.category}
                    </button>
                  )}
                  {selectedSource.origin && (
                    <button
                      onClick={() => {
                        setSelectedSource(null)
                        onTagClick?.(`Show me ${selectedSource.origin} cuisine recipes`)
                      }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      title={`Search for more ${selectedSource.origin} cuisine`}
                    >
                      <Globe className="w-3 h-3" />
                      {selectedSource.origin}
                    </button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSource(null)}
                className="shrink-0 rounded-lg hover:bg-secondary"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {parseContent(selectedSource.content).map((section, idx) => {
                  const Icon = section.icon
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center gap-2 mb-1.5">
                        {Icon && (
                          <div className="p-1 rounded bg-primary/10">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {section.label}
                        </h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pl-7">
                        {section.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border bg-secondary/20 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSource(null)}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
