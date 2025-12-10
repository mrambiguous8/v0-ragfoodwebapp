/**
 * Environment variable validation
 * Validates required env vars at startup to fail fast
 */

interface EnvConfig {
  GROQ_API_KEY: string
  UPSTASH_VECTOR_REST_URL: string
  UPSTASH_VECTOR_REST_TOKEN: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EnvValidationError"
  }
}

/**
 * Validate environment variables
 */
export function validateEnv(): EnvConfig {
  const required = [
    "GROQ_API_KEY",
    "UPSTASH_VECTOR_REST_URL",
    "UPSTASH_VECTOR_REST_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ]

  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please configure these in your Vercel project settings or .env file.`,
    )
  }

  return {
    GROQ_API_KEY: process.env.GROQ_API_KEY!,
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL!,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    UPSTASH_REDIS_REST_URL: process.env.KV_REST_API_URL!,
    UPSTASH_REDIS_REST_TOKEN: process.env.KV_REST_API_TOKEN!,
  }
}

/**
 * Check if environment is properly configured
 */
export function isEnvConfigured(): boolean {
  try {
    validateEnv()
    return true
  } catch {
    return false
  }
}

/**
 * Get missing environment variables
 */
export function getMissingEnvVars(): string[] {
  const required = [
    "GROQ_API_KEY",
    "UPSTASH_VECTOR_REST_URL",
    "UPSTASH_VECTOR_REST_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ]

  return required.filter((key) => !process.env[key])
}
