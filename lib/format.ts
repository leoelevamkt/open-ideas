export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  // value pode ser YYYY-MM-DD ou datetime
  const datePart = value.slice(0, 10)
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return value
  return `${d}/${m}/${y}`
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return formatDate(value)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—"
  return value.slice(0, 5)
}

export function relativeDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return formatDate(value)
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `Há ${diffDays} dias`
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana(s)`
  return formatDate(value)
}

const STATUS_STYLES: Record<string, string> = {
  "Em Análise": "bg-muted text-muted-foreground",
  Protocolado: "bg-chart-3/15 text-chart-3",
  "Em Andamento": "bg-chart-3/15 text-chart-3",
  "Audiência Marcada": "bg-accent/20 text-accent-foreground",
  "Aguardando Decisão": "bg-accent/20 text-accent-foreground",
  Sentenciado: "bg-chart-4/15 text-chart-4",
  Arquivado: "bg-muted text-muted-foreground",
  Finalizado: "bg-chart-4/20 text-chart-4",
}

export function caseStatusClass(status: string): string {
  return STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
}

const HEARING_STYLES: Record<string, string> = {
  Presencial: "bg-chart-3/15 text-chart-3",
  Online: "bg-accent/20 text-accent-foreground",
  Híbrida: "bg-chart-4/15 text-chart-4",
}

export function hearingTypeClass(type: string): string {
  return HEARING_STYLES[type] ?? "bg-muted text-muted-foreground"
}
