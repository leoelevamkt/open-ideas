/**
 * Normaliza valores de data vindos do banco. O driver do Neon pode retornar
 * colunas DATE/TIMESTAMP como objetos Date, então convertemos tudo para string.
 */
type DateLike = string | number | Date | null | undefined

function toDateString(value: DateLike): string {
  if (value == null) return ""
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

export function formatDate(value: DateLike): string {
  const str = toDateString(value)
  if (!str) return "—"
  // str pode ser YYYY-MM-DD ou datetime
  const datePart = str.slice(0, 10)
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return str
  return `${d}/${m}/${y}`
}

export function formatDateTime(value: DateLike): string {
  const str = toDateString(value)
  if (!str) return "—"
  const date = new Date(str.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return formatDate(str)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(value: DateLike): string {
  const str = toDateString(value)
  if (!str) return "—"
  return str.slice(0, 5)
}

/** Retorna YYYY-MM-DD para uso em <input type="date">. */
export function toDateInputValue(value: DateLike): string {
  return toDateString(value).slice(0, 10)
}

export function formatCurrency(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  if (Number.isNaN(n)) return "R$ 0,00"
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function relativeDate(value: DateLike): string {
  const str = toDateString(value)
  if (!str) return "—"
  const date = new Date(str.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return formatDate(str)
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `Há ${diffDays} dias`
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana(s)`
  return formatDate(str)
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

const INVOICE_STYLES: Record<string, string> = {
  pendente: "bg-accent/20 text-accent-foreground",
  pago: "bg-chart-4/20 text-chart-4",
  vencido: "bg-destructive/15 text-destructive",
  cancelado: "bg-muted text-muted-foreground",
}

export function invoiceStatusClass(status: string): string {
  return INVOICE_STYLES[status] ?? "bg-muted text-muted-foreground"
}

export function invoiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago",
    vencido: "Vencido",
    cancelado: "Cancelado",
  }
  return labels[status] ?? status
}

/**
 * Deriva o status exibido de um boleto: se ainda está "pendente" mas a data
 * de vencimento já passou, considera "vencido".
 */
export function effectiveInvoiceStatus(status: string, dueDate: DateLike): string {
  if (status !== "pendente") return status
  const due = toDateString(dueDate).slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  return due < today ? "vencido" : "pendente"
}
