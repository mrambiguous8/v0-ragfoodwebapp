/**
 * Input validation and sanitization utilities
 */

export interface ValidationResult {
  isValid: boolean
  sanitized: string
  error?: string
}

// Patterns that might indicate malicious input
const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=
  /data:text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
]

// Prompt injection patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore (previous|above|all) (instructions|prompts?|commands?)/gi,
  /disregard (previous|above|all) (instructions|prompts?|commands?)/gi,
  /forget (previous|above|all) (instructions|prompts?|commands?)/gi,
  /you are (now|hereby) (instructed|commanded)/gi,
  /new (instructions|system prompt)/gi,
  /override (system|instructions)/gi,
  /\[system\]/gi,
  /\{system\}/gi,
]

/**
 * Validate and sanitize user input
 */
export function validateInput(
  input: string,
  options: {
    maxLength?: number
    minLength?: number
    allowHTML?: boolean
    checkPromptInjection?: boolean
  } = {},
): ValidationResult {
  const { maxLength = 1000, minLength = 1, allowHTML = false, checkPromptInjection = true } = options

  // Trim whitespace
  const trimmed = input.trim()

  // Check length
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: `Input must be at least ${minLength} character(s)`,
    }
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: `Input must be no more than ${maxLength} characters`,
    }
  }

  // Check for empty input after trimming
  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: "Input cannot be empty",
    }
  }

  // Check for suspicious patterns (XSS, etc.)
  if (!allowHTML) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          sanitized: trimmed,
          error: "Input contains potentially malicious content",
        }
      }
    }
  }

  // Check for prompt injection attempts
  if (checkPromptInjection) {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          sanitized: trimmed,
          error: "Input contains suspicious patterns",
        }
      }
    }
  }

  // Basic HTML sanitization (remove tags if HTML not allowed)
  let sanitized = trimmed
  if (!allowHTML) {
    sanitized = trimmed
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&")
  }

  return {
    isValid: true,
    sanitized,
  }
}

/**
 * Validate model ID
 */
export function validateModelId(modelId: string): boolean {
  const validModels = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
  return validModels.includes(modelId)
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Check various headers for IP (in order of preference)
  const xForwardedFor = headers.get("x-forwarded-for")
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim()
  }

  const xRealIP = headers.get("x-real-ip")
  if (xRealIP) {
    return xRealIP.trim()
  }

  // Fallback
  return "unknown"
}
