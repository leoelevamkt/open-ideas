import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: boolean
}) {
  return (
    <Card className="gold-topline overflow-hidden">
      <CardContent className="flex items-center gap-3.5 p-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-gold/25 text-gold-strong ring-1 ring-gold/30"
              : "bg-primary/5 text-primary ring-1 ring-primary/10",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-semibold leading-tight tracking-refined text-foreground">
            {value}
          </p>
          {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
