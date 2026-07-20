import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "Copiar", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(value); setCopied(true); toast.success("Copiado."); setTimeout(() => setCopied(false), 1800); }
      catch { toast.error("Não foi possível copiar."); }
    }} className={cn("inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted", className)}>
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />} {label}
    </button>
  );
}
