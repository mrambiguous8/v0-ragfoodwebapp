"use client"

import { useState } from "react"
import { Utensils, Menu, X, Info, Github, Database, Cpu, Sparkles, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="relative overflow-hidden border-b border-border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOGE1MDAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative max-w-6xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Food RAG
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI Demo
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Retrieval-Augmented Generation Demo
              </p>
            </div>
          </div>

          {/* Tech Stack Badges - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50" title="Vector Search powered by Upstash">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Vector DB</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/50" title="LLM powered by Groq">
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs text-muted-foreground">Llama 3.1</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                Source
              </a>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <nav className="max-w-6xl mx-auto px-4 py-4 space-y-3">
            {/* Tech Stack - Mobile */}
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 text-xs">
                <Database className="w-3 h-3 text-emerald-500" />
                <span className="text-muted-foreground">Vector DB</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 text-xs">
                <Cpu className="w-3 h-3 text-purple-500" />
                <span className="text-muted-foreground">Llama 3.1</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 rounded-lg text-foreground" 
              asChild
            >
              <Link 
                href="/analytics"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="w-5 h-5 text-primary" />
                Analytics Dashboard
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 rounded-lg text-foreground" 
              asChild
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="w-5 h-5 text-primary" />
                View Source Code
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
