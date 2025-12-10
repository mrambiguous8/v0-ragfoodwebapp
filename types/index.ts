// Shared types for the Food RAG application

export interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  searchResults?: SearchResult[]
  timestamp: Date
}

export interface SearchResult {
  id: string
  title: string
  content: string
  relevance: number
  category?: string
  origin?: string
}

export interface UpstashVectorResult {
  id: string
  score: number
  metadata: {
    text: string
    name: string
    category: string
    origin: string
  }
}
