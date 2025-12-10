"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types"
import { User, ChefHat, Share2 } from "lucide-react"
import { ShareModal } from "./share-modal"

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.type === "user"
  const [formattedTime, setFormattedTime] = useState<string>("")
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    setFormattedTime(
      message.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }, [message.timestamp])

  return (
    <>
      <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/80"
              : "bg-gradient-to-br from-accent to-accent/80"
          )}
        >
          {isUser ? (
            <User className="w-5 h-5 text-primary-foreground" />
          ) : (
            <ChefHat className="w-5 h-5 text-accent-foreground" />
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl px-5 py-3.5 max-w-md lg:max-w-2xl shadow-sm",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
              : "bg-card border border-border/50 text-foreground rounded-tl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className={cn(
            "flex items-center justify-between mt-2 gap-3",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formattedTime && (
              <span className="text-xs">
                {formattedTime}
              </span>
            )}
            {!isUser && (
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1 text-xs hover:text-primary transition-colors"
                title="Share this response"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        content={message.content}
        title="Food RAG Discovery"
      />
    </>
  )
}
