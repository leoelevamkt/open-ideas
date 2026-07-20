type DateLike = string | number | Date | null | undefined;

function toStr(v: DateLike) { if (v == null) return ""; if (v instanceof Date) return v.toISOString(); return String(v); }

export function formatDate(v: DateLike) {
  const s = toStr(v); if (!s) return "—";
  const [y, m, d] = s.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : s;
}
export function formatDateTime(v: DateLike) {
  const s = toStr(v); if (!s) return "—";
  const dt = new Date(s.replace(" ", "T"));
  return Number.isNaN(dt.getTime()) ? formatDate(s)
    : dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function formatTime(v: DateLike) { const s = toStr(v); return s ? s.slice(0, 5) : "—"; }
export function toDateInputValue(v: DateLike) { return toStr(v).slice(0, 10); }
export function formatCurrency(v: number | string | null | undefined) {
  const n = Number(v ?? 0); if (Number.isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function relativeDate(v: DateLike) {
  const s = toStr(v); if (!s) return "—";
  const dt = new Date(s.replace(" ", "T")); if (Number.isNaN(dt.getTime())) return formatDate(s);
  const days = Math.floor((Date.now() - dt.getTime()) / 86400000);
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  if (days < 30) return `Há ${Math.floor(days / 7)} semana(s)`;
  return formatDate(s);
}

export function invoiceStatusLabel(s: string) {
  return ({ pendente: "Pendente", pago: "Pago", vencido: "Vencido", cancelado: "Cancelado" } as any)[s] ?? s;
}
export function effectiveInvoiceStatus(status: string, dueDate: DateLike) {
  if (status !== "pendente") return status;
  const due = toStr(dueDate).slice(0, 10);
  return due < new Date().toISOString().slice(0, 10) ? "vencido" : "pendente";
}
export function invoiceStatusClass(s: string) {
  return ({
    pendente: "bg-amber-100 text-amber-700",
    pago: "bg-emerald-100 text-emerald-700",
    vencido: "bg-red-100 text-red-700",
    cancelado: "bg-muted text-muted-foreground",
  } as any)[s] ?? "bg-muted text-muted-foreground";
}
