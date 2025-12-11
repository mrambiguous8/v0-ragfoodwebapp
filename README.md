# 🍳 Food RAG Web Application

> A full-stack Retrieval-Augmented Generation (RAG) application showcasing modern AI-powered food discovery and recipe assistance.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://v0-food-rag-web-app.vercel.app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.app/chat/giVUaccSDfd)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## 📋 Project Overview

This project demonstrates a **production-ready RAG system** that combines:
- **Semantic Vector Search** for intelligent food/recipe discovery
- **Large Language Model (LLM)** responses for natural conversation
- **Real-time Analytics** for monitoring system performance
- **Modern Web Interface** with responsive design
- **Smart Caching** - 1-hour response cache to reduce API costs (~60-80% reduction)
- **Rate Limiting** - IP-based sliding window (10 requests/min) with automatic blocking
- **Security Features** - XSS protection and prompt injection prevention

### 🎯 What It Does

Ask natural language questions about food, recipes, and cooking techniques. The system:
1. Converts your query into vector embeddings
2. Searches a knowledge base of 100 diverse food items
3. Retrieves the most relevant matches
4. Generates a helpful, context-aware response using LLM

**Example Queries:**
- *"Give me a 10-minute breakfast recipe"*
- *"What can I cook with chicken and spinach?"*
- *"Suggest a vegetarian dinner under 500 calories"*
- *"Best grilling techniques for meat"*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                        (Next.js 16 + React 19.2)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RAG PIPELINE                                     │
│  ┌──────────────┐    ┌──────────────────┐     ┌─────────────────────────┐   │
│  │   1. Query   │─▶ │ 2. Vector Search │───▶│ 3. Context Retrieval    │   │
│  │   Input      │    │  (Upstash Vector)│     │    (Top-K Results)      │   │
│  └──────────────┘    └──────────────────┘     └─────────────────────────┘   │
│                                                           │                 │
│                                                           ▼                 │
│                             ┌─────────────────────────────────────────────┐ │
│                             │ 4. LLM Generation (Groq - Llama 3.1/3.3)    │ │
│                             └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANALYTICS & MONITORING                              │
│                            (Upstash Redis)                                   │
│         Query Tracking │ Performance Metrics │ Error Logging                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19.2, Tailwind CSS v4 | Modern web interface |
| **UI Components** | shadcn/ui | Accessible, customizable components |
| **Vector Database** | Upstash Vector | Semantic search with embeddings |
| **LLM Provider** | Groq (Llama 3.1 8B / 70B) | Fast AI response generation |
| **Caching** | Upstash Redis | Response caching (1-hour TTL) & rate limiting |
| **Analytics** | Vercel Analytics + Custom | Query tracking & performance monitoring |
| **Deployment** | Vercel | Serverless hosting with edge functions |
| **Development** | v0.dev | AI-assisted UI development |
| **Language** | TypeScript | Fully typed codebase |

---

## 🚀 Live Demo

### 🔗 **[Try the Live Application →](https://v0-ragfoodwebapp-uw.vercel.app/)**

### Usage Examples

| Query Type | Example |
|------------|---------|
| **Quick Meals** | "Give me a 10-minute breakfast recipe" |
| **Ingredient-Based** | "What can I cook with chicken and spinach?" |
| **Dietary Preferences** | "Suggest a vegetarian dinner under 500 calories" |
| **Cooking Techniques** | "Best grilling techniques for meat" |

---

## 📅 Development Journey

This project evolved through a 3-week development process:

### Week 2: Local Development
- Set up Python RAG pipeline with local vector store
- Implemented basic semantic search functionality
- Tested with sample food data

### Week 3: Cloud Migration
- Migrated vector database to **Upstash Vector**
- Integrated **Groq LLM API** for response generation
- Added cloud-based embedding generation

### Week 4: Web Application
- Built full-stack Next.js application
- Designed modern chat interface with **v0.dev**
- Added analytics dashboard with **Upstash Redis**
- Deployed to production on **Vercel**

---

## ✨ Features Showcase

### 💬 Intelligent Chat Interface
- Natural language food queries
- Real-time typing indicators
- Model selection (Llama 3.1 8B fast / 70B powerful)
- Suggested questions for quick start
- Auto-trim chat history to last 50 messages
- Abort controllers for proper cleanup of in-flight requests

### 📊 RAG Source Display
- Collapsible source cards showing retrieved documents
- Relevance percentage badges (color-coded)
- Clickable category/origin tags for related searches
- Expandable modal for full document details

### 📈 Analytics Dashboard
- Total query count & success rate
- Response time metrics (search + generation)
- Daily query trends (7-day visualization)
- Model usage breakdown
- Error breakdown by type
- Vector search performance

### 🔒 Security Features
- **Rate Limiting**: 10 requests per minute per IP with automatic blocking
- **Input Sanitization**: XSS prevention and prompt injection protection
- **Request Caching**: Deduplication to prevent abuse
- **Environment Validation**: Runtime checks for required configuration
- **Error Handling**: Graceful degradation with user-friendly messages

### 🗄️ Database Management
- View all food items with pagination
- Add new items with metadata
- Bulk delete functionality
- Search/filter capabilities

---

## 🍽️ Food Database

The knowledge base contains **35+ diverse food items** across multiple categories:

| Category | Examples |
|----------|----------|
| **Healthy Breakfast** | Spinach Mushroom Omelet, Greek Yogurt Parfait |
| **Quick Meals** | 10-Minute Stir Fry, Avocado Toast |
| **Vegetarian** | Vegetable Curry, Quinoa Salad |
| **Grilling** | BBQ Techniques, Marinated Steaks |
| **International** | Japanese, Mexican, Mediterranean cuisines |
| **Desserts** | Healthy treats, Fruit-based options |

Each item includes:
- Name, Category, Origin
- Detailed Description
- Ingredients & Preparation
- Nutritional Highlights
- Dietary Classifications

---

## ⚡ Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| **Vector Search Latency** | < 500ms | ~200-400ms |
| **LLM Generation (8B)** | < 3s | ~1-2s |
| **LLM Generation (70B)** | < 10s | ~3-6s |
| **Total Response Time** | < 5s | ~2-4s |
| **Success Rate** | > 95% | 98%+ |

### 🧪 Advanced Test Suite Results

Comparison between the deployed Web App and Python CLI (local system) using 15 queries across 5 categories.

#### Test Results Summary

| Metric | Web App (Cloud) | Python CLI (Local) |
|--------|-----------------|---------------------|
| **Avg Response Time** | ~1.3s | ~10.2s |
| **Success Rate** | 15/15 (100%) | 15/15 (100%) |
| **Avg Quality Score** | 3.0/5.0 | 4.4/5.0 |

#### Key Findings

1. **Speed**: The deployed web app is **~8x faster** than the local Python CLI (1.3s vs 10.2s average response time)

2. **Reliability**: Both systems achieved **100% success rate** across all 15 test queries

3. **Quality**: The local system scored higher on automated quality metrics (4.4/5.0 vs 3.0/5.0), likely due to different response formatting and length

4. **Test Coverage**: All 15 queries succeeded across 5 categories:
   - Semantic Similarity (3 queries)
   - Multi-Criteria Search (3 queries)
   - Nutritional Queries (3 queries)
   - Cultural Exploration (3 queries)
   - Cooking Method (3 queries)

5. **Cost Efficiency**: Average API cost per query: ~$0.000065 (Groq LLM tokens)

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Upstash account (Vector + Redis)
- Groq API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ragfood_web_app.git
cd ragfood_web_app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Groq AI
GROQ_API_KEY=your_groq_api_key

# Upstash Vector
UPSTASH_VECTOR_REST_URL=your_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_vector_token

# Upstash Redis (for caching & rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Compatibility aliases (optional)
KV_REST_API_URL=${UPSTASH_REDIS_REST_URL}
KV_REST_API_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
```

### 4. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production
```bash
pnpm build
pnpm start
```

---

## 📚 API Documentation

### Upstash Vector Integration

The application uses Upstash Vector's REST API with built-in embeddings:

```typescript
// Vector Search Query
const response = await fetch(`${UPSTASH_VECTOR_REST_URL}/query-data`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${UPSTASH_VECTOR_REST_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    data: "your search query",  // Auto-embedded by Upstash
    topK: 3,                    // Number of results
    includeMetadata: true,      // Include food item details
  }),
})
```

### Groq LLM Integration

Using the `@ai-sdk/groq` package for LLM generation:

```typescript
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const { text } = await generateText({
  model: groq("llama-3.1-8b-instant"),  // or "llama-3.3-70b-versatile"
  system: "You are a food expert assistant...",
  prompt: `Context: ${retrievedDocs}\n\nQuestion: ${userQuery}`,
  temperature: 0.7,
  maxTokens: 1024,
})
```

### Available Models

| Model ID | Description | Use Case |
|----------|-------------|----------|
| `llama-3.1-8b-instant` | Fast responses, good quality | Quick queries |
| `llama-3.1-70b-versatile` | Higher quality, more detailed | Complex questions |

---

## 📁 Project Structure

```
ragfood_web_app/
├── app/
│   ├── page.tsx              # Main chat page
│   ├── layout.tsx            # Root layout
│   ├── analytics/            # Analytics dashboard
│   ├── admin/food-items/     # Database management
│   └── api/                  # API routes
├── components/
│   ├── chat-interface.tsx    # Main chat component
│   ├── search-results.tsx    # Source cards display
│   ├── model-selector.tsx    # Model dropdown
│   └── ui/                   # shadcn components
├── lib/
│   ├── food-rag-actions.ts   # Core RAG logic
│   ├── analytics.ts          # Analytics tracking
│   ├── env-validator.ts      # Environment validation
│   ├── input-validator.ts    # Input sanitization
│   ├── rate-limiter.ts       # Rate limiting
│   ├── request-cache.ts      # Response caching
│   └── models.ts             # Model configuration
├── docs/                     # Project documentation
└── types/                    # TypeScript definitions
```

---

## 🔗 Links

- **Live Demo**: [https://v0-ragfoodwebapp-uw.vercel.app/]

---

<p align="center">
  Built with ❤️ using Next.js, Upstash, and Groq
</p>
