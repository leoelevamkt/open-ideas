import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  // Processos
  "Protocolado": "bg-chart-3/15 text-chart-3 border-chart-3/30",
  "Em Análise": "bg-muted text-muted-foreground border-border",
  "Em Andamento": "bg-chart-3/15 text-chart-3 border-chart-3/30",
  "Audiência Marcada": "bg-accent/20 text-accent-foreground border-accent/40",
  "Recurso": "bg-chart-5/15 text-chart-5 border-chart-5/30",
  "Arquivado": "bg-muted text-muted-foreground border-border",
  "Encerrado": "bg-chart-4/15 text-chart-4 border-chart-4/30",
  // Genéricos
  ativo: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  arquivado: "bg-muted text-muted-foreground border-border",
  disponivel: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  pendente: "bg-accent/20 text-accent-foreground border-accent/40",
}

const LABELS: Record<string, string> = {
  ativo: "Ativo",
  arquivado: "Arquivado",
  disponivel: "Disponível",
  pendente: "Pendente",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border"
  const label = LABELS[status] ?? status
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {label}
    </Badge>
  )
}
