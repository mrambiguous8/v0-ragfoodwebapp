# Food RAG Web App

A production-ready **Retrieval-Augmented Generation (RAG)** application that combines semantic vector search with large language models to provide intelligent cooking and recipe assistance.

## Features

- **AI-Powered Chat Interface** - Natural language queries about recipes, ingredients, and cooking techniques
- **Vector Search** - Semantic search using Upstash Vector DB for relevant context retrieval
- **Multiple LLM Models** - Choose between Llama 3.1 8B (fast) or 70B (powerful) via Groq
- **Smart Caching** - 1-hour response cache to reduce API costs and improve performance
- **Rate Limiting** - IP-based sliding window rate limiter (10 requests/min) with automatic blocking
- **Analytics Dashboard** - Track queries, performance metrics, and usage patterns
- **Input Validation** - XSS protection and prompt injection prevention
- **Mobile Optimized** - Touch-friendly interface with responsive design
- **Dark Mode** - System-aware theme switching

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19.2
- **AI/ML**: Groq SDK with Llama 3.1 models
- **Vector Database**: Upstash Vector
- **Caching**: Upstash Redis
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Analytics**: Vercel Analytics + custom tracking
- **TypeScript**: Fully typed codebase

## Architecture

\`\`\`
User Query → Input Validation → Rate Limit Check → Cache Check
                                                       ↓
                                                   Cache Miss
                                                       ↓
                                    Vector Search (Top 3 Results)
                                                       ↓
                                    LLM Generation (with context)
                                                       ↓
                                          Cache + Analytics Tracking
                                                       ↓
                                                   Response
\`\`\`

## Environment Variables

Required environment variables (automatically configured if using Vercel integrations):

\`\`\`env
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
\`\`\`

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Environment Variables

Create a `.env.local` file with your API keys (see above).

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── analytics/       # Analytics API endpoints
│   │   ├── chat/            # Main RAG query endpoint
│   │   └── food-items/      # Vector DB management
│   ├── analytics/           # Analytics dashboard page
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main chat interface page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── chat-interface.tsx   # Main chat component
│   ├── chat-message.tsx     # Message display
│   ├── model-selector.tsx   # LLM model switcher
│   └── search-results.tsx   # Vector search results
├── lib/
│   ├── analytics.ts         # Analytics tracking
│   ├── env-validator.ts     # Environment validation
│   ├── food-rag-actions.ts  # Core RAG logic
│   ├── input-validator.ts   # Input sanitization
│   ├── rate-limiter.ts      # Rate limiting
│   └── request-cache.ts     # Response caching
└── types/
    └── index.ts             # TypeScript types
\`\`\`

## Security Features

- **Rate Limiting**: 10 requests per minute per IP with automatic blocking
- **Input Sanitization**: XSS prevention and prompt injection protection
- **Request Caching**: Deduplication to prevent abuse
- **Environment Validation**: Runtime checks for required configuration
- **Error Handling**: Graceful degradation with user-friendly messages

## Performance Optimizations

- **Response Caching**: 1-hour TTL reduces API calls by ~60-80%
- **Memory Management**: Auto-trim chat history to last 50 messages
- **Lazy Loading**: Search results and components load on demand
- **Request Deduplication**: Identical queries share cached results
- **Abort Controllers**: Proper cleanup of in-flight requests

## Analytics

Access the analytics dashboard at `/analytics` to view:

- Total queries and success rate
- Average response latency
- Model usage distribution
- Error breakdown by type
- Daily query trends
- Vector search performance

## API Endpoints

### POST `/api/chat`

Main RAG query endpoint.

**Request:**
\`\`\`json
{
  "query": "What can I cook with chicken?",
  "modelId": "llama-3.1-70b-versatile"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "text": "Here are some chicken recipes...",
  "searchResults": [...],
  "metrics": {
    "searchDuration": 150,
    "generationDuration": 2340,
    "totalDuration": 2490
  }
}
\`\`\`

## Deployment

### Deploy to Vercel (Recommended)

1. Click the "Publish" button in v0
2. Connect your Vercel account
3. Add the required integrations:
   - Groq (for LLM)
   - Upstash Vector (for search)
   - Upstash Redis (for caching)
4. Deploy automatically

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

Ensure all environment variables are set in your hosting platform.

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions, please open an issue on GitHub.
