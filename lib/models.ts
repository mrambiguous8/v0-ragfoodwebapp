// Centralized model configuration - easy to extend with new models

export const AVAILABLE_MODELS = [
  {
    id: "llama-3.1-8b-instant",
    label: "8B – Fast",
    shortLabel: "8B",
    description: "Faster responses, lower cost",
    icon: "Zap",
  },
  {
    id: "llama-3.3-70b-versatile",
    label: "70B – Capable",
    shortLabel: "70B",
    description: "Higher quality, more detailed",
    icon: "Brain",
  },
] as const

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"]
export type ModelConfig = (typeof AVAILABLE_MODELS)[number]

export const DEFAULT_MODEL: ModelId = "llama-3.1-8b-instant"

export function getModelConfig(modelId: ModelId): ModelConfig {
  return AVAILABLE_MODELS.find((m) => m.id === modelId) ?? AVAILABLE_MODELS[0]
}
