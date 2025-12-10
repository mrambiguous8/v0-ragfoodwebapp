"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Copy, Check, Twitter, Facebook, Link2 } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title?: string
}

export function ShareModal({ isOpen, onClose, content, title = "Food RAG Discovery" }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Truncate content for sharing (Twitter has character limits)
  const truncateForShare = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + "..."
  }

  const shareText = truncateForShare(content, 200)
  const fullShareText = `🍳 ${title}\n\n${shareText}\n\n— via Food RAG AI Assistant`

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleTwitterShare = () => {
    const twitterText = encodeURIComponent(truncateForShare(fullShareText, 280))
    window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, "_blank", "noopener,noreferrer")
  }

  const handleFacebookShare = () => {
    // Facebook sharing works best with a URL, but we can use the share dialog
    const facebookText = encodeURIComponent(fullShareText)
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${facebookText}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Share this discovery
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-secondary"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="bg-secondary/30 rounded-xl p-4 mb-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="text-sm text-foreground line-clamp-4">{fullShareText}</p>
          </div>

          {/* Share Options */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-secondary/50"
              onClick={handleCopyToClipboard}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
              <span>{copied ? "Copied to clipboard!" : "Copy to clipboard"}</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30 hover:text-[#1DA1F2]"
              onClick={handleTwitterShare}
            >
              <Twitter className="w-5 h-5" />
              <span>Share on X (Twitter)</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-[#4267B2]/10 hover:border-[#4267B2]/30 hover:text-[#4267B2]"
              onClick={handleFacebookShare}
            >
              <Facebook className="w-5 h-5" />
              <span>Share on Facebook</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-secondary/20 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
