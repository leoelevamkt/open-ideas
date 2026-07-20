"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  label = "Copiar",
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Copiado para a área de transferência.")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Não foi possível copiar.")
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted",
        className,
      )}
      aria-label={label}
    >
      {copied ? (
        <Check className="size-3.5 text-chart-4" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {label}
    </button>
  )
}
