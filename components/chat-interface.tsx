"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage } from "./chat-message"
import { SearchResults } from "./search-results"
import { TypingIndicator, SearchResultsSkeleton } from "./typing-indicator"
import { Button } from "@/components/ui/button"
import {
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  SearchX,
  UtensilsCrossed,
  Flame,
  WifiOff,
  Clock,
  RotateCcw,
  Leaf,
} from "lucide-react"
import { processRAGQuery } from "@/lib/food-rag-actions"
import { ModelSelector } from "./model-selector"
import { DEFAULT_MODEL, type ModelId } from "@/lib/models"
import type { Message } from "@/types"

const MAX_INPUT_LENGTH = 500
const REQUEST_TIMEOUT = 60000 // 60 seconds (longer for 70B model)
const MAX_MESSAGES = 50

const SUGGESTED_QUESTIONS = [
  {
    icon: Clock,
    text: "Give me a 10-minute breakfast recipe",
    color: "text-amber-600",
    tooltip: "Quick morning meals",
  },
  {
    icon: UtensilsCrossed,
    text: "What can I cook with chicken and spinach?",
    color: "text-green-600",
    tooltip: "Ingredient-based suggestions",
  },
  {
    icon: Leaf,
    text: "Suggest a vegetarian dinner under 500 calories",
    color: "text-emerald-600",
    tooltip: "Healthy veggie options",
  },
  { icon: Flame, text: "Best grilling techniques for meat", color: "text-red-600", tooltip: "Master outdoor cooking" },
]

type LoadingStage = "idle" | "searching" | "generating"
type ErrorType = "timeout" | "network" | "api" | "unknown"

interface ErrorState {
  type: ErrorType
  message: string
}

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string; icon: typeof AlertCircle }> = {
  timeout: {
    title: "Request timed out",
    description: "The server took too long to respond. Please try again.",
    icon: Clock,
  },
  network: {
    title: "Connection problem",
    description: "Please check your internet connection and try again.",
    icon: WifiOff,
  },
  api: {
    title: "Service unavailable",
    description: "Our recipe service is temporarily unavailable. Please try again shortly.",
    icon: AlertCircle,
  },
  unknown: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    icon: AlertCircle,
  },
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle")
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loadingStage])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_INPUT_LENGTH) {
      setInput(value)
    }
  }

  const classifyError = (error: unknown): ErrorType => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes("timeout") || message.includes("aborted") || message.includes("timed out")) return "timeout"
      if (message.includes("rate limit") || message.includes("429")) return "api"
      if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch"))
        return "network"
      if (
        message.includes("api") ||
        message.includes("server") ||
        message.includes("500") ||
        message.includes("503") ||
        message.includes("unavailable")
      )
        return "api"
    }
    return "unknown"
  }

  const processQuery = useCallback(
    async (query: string, isRetry = false, modelId: ModelId = selectedModel) => {
      // Cancel any existing request
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setLoadingStage("searching")
      setLastFailedQuery(null)
      setErrorState(null)

      if (isRetry) {
        setRetryCount((prev) => prev + 1)
      } else {
        setRetryCount(0)
      }

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
      })

      try {
        // Use the new processRAGQuery that includes analytics tracking
        const ragResponse = await Promise.race([processRAGQuery(query, modelId), timeoutPromise])

        // Stage update for UI
        setLoadingStage("generating")

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: ragResponse.text,
          searchResults: ragResponse.searchResults.length > 0 ? ragResponse.searchResults : undefined,
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage]
          if (newMessages.length > MAX_MESSAGES) {
            return newMessages.slice(-MAX_MESSAGES)
          }
          return newMessages
        })
        setRetryCount(0)
      } catch (error) {
        const errorType = classifyError(error)
        setErrorState({
          type: errorType,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        setLastFailedQuery(query)

        // Don't add error message to chat - show inline error UI instead
      } finally {
        setIsLoading(false)
        setLoadingStage("idle")
      }
    },
    [selectedModel],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => {
      const newMessages = [...prev, userMessage]
      if (newMessages.length > MAX_MESSAGES) {
        return newMessages.slice(-MAX_MESSAGES)
      }
      return newMessages
    })
    const query = input
    setInput("")
    await processQuery(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: suggestion,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    processQuery(suggestion)
  }

  const handleRetry = () => {
    if (lastFailedQuery) {
      processQuery(lastFailedQuery, true, selectedModel)
    }
  }

  const handleDismissError = () => {
    setErrorState(null)
    setLastFailedQuery(null)
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setErrorState(null)
    setLastFailedQuery(null)
    setRetryCount(0)
  }

  const characterCount = input.length
  const isNearLimit = characterCount > MAX_INPUT_LENGTH * 0.8
  const isEmptyState = messages.length === 0

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
          {/* New Chat Button - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2 rounded-lg text-muted-foreground hover:text-foreground bg-transparent"
                title="Start a new conversation"
              >
                <RotateCcw className="w-4 h-4" />
                New Chat
              </Button>
            </div>
          )}
          {/* Empty State with Welcome & Suggestions */}
          {isEmptyState && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              {/* Decorative Food Icons */}
              <div className="relative mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-4 ring-primary/10">
                  <UtensilsCrossed className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">AI Cooking Assistant</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mb-4">
                Powered by <span className="font-medium text-foreground/80">Vector Search</span> and{" "}
                <span className="font-medium text-foreground/80">Large Language Models</span>
              </p>

              {/* How It Works - Mini Pipeline */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20"
                  title="Your question is converted to vectors and matched against our food knowledge base"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">1.</span> Vector Search
                </div>
                <span className="text-muted-foreground/50 hidden sm:inline">→</span>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium border border-purple-500/20"
                  title="Relevant food documents are retrieved and passed as context"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="hidden sm:inline">2.</span> Context Retrieval
                </div>
                <span className="text-muted-foreground/50 hidden sm:inline">→</span>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20"
                  title="Llama 3.1 generates a helpful response using the retrieved context"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="hidden sm:inline">3.</span> LLM Response
                </div>
              </div>

              {/* Suggested Questions Grid */}
              <div className="w-full max-w-2xl">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
                  Try asking about...
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      title={suggestion.tooltip}
                      className="group flex items-center gap-3 p-4 min-h-[56px] rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.98] transition-all text-left touch-manipulation"
                    >
                      <div
                        className={`p-2.5 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors shrink-0`}
                      >
                        <suggestion.icon className={`w-5 h-5 ${suggestion.color}`} />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ChatMessage message={message} />
              {message.type === "assistant" && message.searchResults && message.searchResults.length > 0 && (
                <div className="mt-3 ml-0 md:ml-12 relative">
                  {/* Visual connector line */}
                  <div className="absolute -top-3 left-6 w-0.5 h-3 bg-border hidden md:block" />
                  <SearchResults results={message.searchResults} onTagClick={handleSuggestionClick} />
                </div>
              )}
              {message.type === "assistant" && (!message.searchResults || message.searchResults.length === 0) && (
                <div className="mt-3 ml-0 md:ml-12 flex items-center gap-2 text-muted-foreground bg-secondary/50 rounded-lg px-4 py-3 border border-border/30">
                  <SearchX className="w-4 h-4" />
                  <span className="text-sm">No matching items found in the knowledge base.</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading State with Typing Indicator */}
          {isLoading && loadingStage !== "idle" && (
            <div className="space-y-4">
              <TypingIndicator stage={loadingStage === "searching" ? "searching" : "generating"} />
              {loadingStage === "generating" && (
                <div className="ml-0 md:ml-12">
                  <SearchResultsSkeleton />
                </div>
              )}
            </div>
          )}

          {/* Enhanced Error State */}
          {errorState && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 md:p-5 max-w-md shake">
                <div className="flex items-start gap-3">
                  {(() => {
                    const ErrorIcon = ERROR_MESSAGES[errorState.type].icon
                    return (
                      <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ErrorIcon className="w-5 h-5 text-destructive" />
                      </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-destructive text-sm">{ERROR_MESSAGES[errorState.type].title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{ERROR_MESSAGES[errorState.type].description}</p>
                    {retryCount > 0 && retryCount < 3 && (
                      <p className="text-xs text-muted-foreground mt-2">Retry attempt {retryCount}/3</p>
                    )}
                    {retryCount >= 3 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Multiple retries failed. The service may be temporarily unavailable.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 ml-13">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRetry}
                    disabled={retryCount >= 5}
                    className="gap-1.5 h-9 px-4 rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissError}
                    className="h-9 px-3 rounded-lg text-muted-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form - Mobile Optimized */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-card/80 backdrop-blur-md px-4 py-4 md:py-5 shrink-0 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] safe-area-bottom"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 md:gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me for a recipe... 🍳"
                className="w-full rounded-xl border border-input bg-background px-4 md:px-5 py-3.5 md:py-3.5 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm min-h-[48px]"
                disabled={isLoading}
                maxLength={MAX_INPUT_LENGTH}
                aria-label="Type your food question"
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="on"
              />
            </div>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={isLoading} />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 gap-2 rounded-xl px-4 md:px-6 min-h-[48px] md:h-[50px] min-w-[48px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline font-medium">Send</span>
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2.5 px-1">
            <p className="text-xs text-muted-foreground hidden sm:block">Press Enter to send</p>
            <div className="flex items-center gap-3 ml-auto">
              {isLoading && (
                <span className="text-xs text-primary font-medium animate-pulse">
                  {loadingStage === "searching" ? "Searching..." : "Generating..."}
                </span>
              )}
              <p
                className={`text-xs tabular-nums ${isNearLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
              >
                {characterCount}/{MAX_INPUT_LENGTH}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
