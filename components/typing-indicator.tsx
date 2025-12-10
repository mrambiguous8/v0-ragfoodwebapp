"use client"

import { ChefHat, Sparkles } from "lucide-react"

interface TypingIndicatorProps {
  stage: "searching" | "generating" | "thinking"
}

const stageMessages = {
  searching: "Searching the recipe knowledge base...",
  generating: "Crafting your personalized response...",
  thinking: "Thinking...",
}

export function TypingIndicator({ stage }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
        <ChefHat className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-md">
        <div className="bg-card border border-border/50 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Animated Dots */}
            <div className="flex items-center gap-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
              <span className="typing-dot w-2 h-2 rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
              <span className="typing-dot w-2 h-2 rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
            </div>
            
            {/* Stage Message */}
            <span className="text-sm text-muted-foreground font-medium">
              {stageMessages[stage]}
            </span>
            
            {/* Sparkle animation */}
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-primary to-accent rounded-full ${
                stage === "searching" ? "loading-bar-searching" : "loading-bar-generating"
              }`}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {stage === "searching" ? "Step 1/2" : "Step 2/2"}
          </span>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for search results
export function SearchResultsSkeleton() {
  return (
    <div className="border border-border/50 rounded-xl bg-gradient-to-br from-secondary/30 to-background overflow-hidden animate-pulse">
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary" />
        <div className="h-4 w-24 bg-secondary rounded" />
        <div className="h-5 w-8 bg-secondary rounded-full ml-auto" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-border/30 rounded-lg bg-card/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-secondary" />
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-5 w-16 bg-secondary rounded-full ml-auto" />
            </div>
            <div className="space-y-2 pl-8">
              <div className="h-3 w-full bg-secondary rounded" />
              <div className="h-3 w-3/4 bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
