"use client"

import { Database, Cpu, Code2, Layers } from "lucide-react"

const TECH_STACK = [
  { name: "Next.js 16", icon: Layers, color: "text-foreground" },
  { name: "Upstash Vector", icon: Database, color: "text-emerald-500" },
  { name: "Groq Llama 3.1", icon: Cpu, color: "text-purple-500" },
  { name: "TypeScript", icon: Code2, color: "text-blue-500" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Built with</span>
          <div className="flex items-center gap-3">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 border border-border/50"
                title={tech.name}
              >
                <tech.icon className={`w-3 h-3 ${tech.color}`} />
                <span className="text-[10px] font-medium text-muted-foreground">{tech.name}</span>
              </div>
            ))}
            <span className="sm:hidden text-muted-foreground">
              Next.js • Upstash • Groq • TypeScript
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="hidden sm:inline">RAG Demo Project</span>
          <span className="opacity-50">•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
