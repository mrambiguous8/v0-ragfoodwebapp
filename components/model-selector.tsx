"use client"

import { useState, useRef, useEffect } from "react"
import { Zap, Brain, ChevronDown, Check } from "lucide-react"
import { AVAILABLE_MODELS, type ModelId, getModelConfig } from "@/lib/models"

interface ModelSelectorProps {
  value: ModelId
  onChange: (modelId: ModelId) => void
  disabled?: boolean
}

const iconMap = {
  Zap: Zap,
  Brain: Brain,
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentModel = getModelConfig(value)
  const CurrentIcon = iconMap[currentModel.icon as keyof typeof iconMap]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const handleSelect = (modelId: ModelId) => {
    onChange(modelId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-2 h-[48px] md:h-[50px]
          rounded-xl border border-input bg-background
          text-sm font-medium text-foreground
          hover:bg-secondary/50 hover:border-primary/30
          focus:outline-none focus:ring-2 focus:ring-primary/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? "ring-2 ring-primary/50 border-primary/30" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select AI model. Current: ${currentModel.label}`}
      >
        <CurrentIcon className={`w-4 h-4 ${currentModel.icon === "Zap" ? "text-amber-500" : "text-purple-500"}`} />
        <span className="hidden sm:inline">{currentModel.shortLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute bottom-full mb-2 right-0 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="listbox"
          aria-label="Available AI models"
        >
          <div className="p-1.5">
            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Select Model
            </p>
            {AVAILABLE_MODELS.map((model) => {
              const Icon = iconMap[model.icon as keyof typeof iconMap]
              const isSelected = model.id === value

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelect(model.id)}
                  className={`
                    w-full flex items-start gap-3 px-3 py-2.5 rounded-lg
                    text-left transition-colors duration-150
                    ${isSelected 
                      ? "bg-primary/10 text-foreground" 
                      : "hover:bg-secondary/50 text-foreground"
                    }
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={`
                    p-1.5 rounded-lg shrink-0 mt-0.5
                    ${model.icon === "Zap" 
                      ? "bg-amber-500/10 text-amber-500" 
                      : "bg-purple-500/10 text-purple-500"
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{model.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {model.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Footer hint */}
          <div className="px-4 py-2 bg-secondary/30 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ⚡ Fast = quicker &amp; cheaper • 🧠 Capable = better quality
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
