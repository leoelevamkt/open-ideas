import Link from "next/link"
import { CalendarClock, FileText, Trash2, RotateCcw } from "lucide-react"
import type { Case, Client, Invoice } from "@/lib/types"
import {
  formatCurrency,
  formatDate,
  effectiveInvoiceStatus,
  invoiceStatusClass,
  invoiceStatusLabel,
} from "@/lib/format"
import { deleteInvoiceAction, setInvoiceStatusAction } from "@/lib/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/finance/copy-button"
import { MarkPaidButton } from "@/components/finance/mark-paid-button"
import { InvoiceFormDialog } from "@/components/finance/invoice-form-dialog"

type InvoiceRow = Invoice & { client_name?: string | null; case_title?: string | null }

export function InvoicesList({
  invoices,
  role,
  clients = [],
  cases = [],
}: {
  invoices: InvoiceRow[]
  role: "advogado" | "cliente"
  clients?: Client[]
  cases?: Case[]
}) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
          <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Nenhum boleto por aqui ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {invoices.map((inv) => {
        const status = effectiveInvoiceStatus(inv.status, inv.due_date)
        const isPaid = inv.status === "pago"
        return (
          <Card key={inv.id} className="overflow-hidden">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{inv.description}</p>
                  {role === "advogado" && inv.client_name ? (
                    <p className="truncate text-xs text-muted-foreground">{inv.client_name}</p>
                  ) : null}
                  {inv.case_title ? (
                    <p className="truncate text-xs text-muted-foreground">{inv.case_title}</p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${invoiceStatusClass(status)}`}
                >
                  {invoiceStatusLabel(status)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xl font-bold tracking-tight text-foreground">
                    {formatCurrency(inv.amount)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" aria-hidden="true" />
                    Vencimento: {formatDate(inv.due_date)}
                  </p>
                </div>
                {role === "advogado" ? (
                  <div className="flex items-center gap-1">
                    <InvoiceFormDialog clients={clients} cases={cases} invoice={inv} />
                    <form action={setInvoiceStatusAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <input type="hidden" name="status" value={isPaid ? "pendente" : "pago"} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={isPaid ? "Marcar como pendente" : "Marcar como pago"}
                        title={isPaid ? "Reabrir" : "Marcar como pago"}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </form>
                    <form action={deleteInvoiceAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        aria-label="Excluir boleto"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>

              {inv.notes ? (
                <p className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">{inv.notes}</p>
              ) : null}

              {(inv.barcode || inv.pix_copy_paste || inv.payment_link) && !isPaid ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {inv.barcode ? (
                    <CopyButton value={inv.barcode} label="Copiar código de barras" />
                  ) : null}
                  {inv.pix_copy_paste ? (
                    <CopyButton value={inv.pix_copy_paste} label="Copiar PIX" />
                  ) : null}
                  {inv.payment_link ? (
                    <Link
                      href={inv.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <FileText className="size-3.5" aria-hidden="true" />
                      Abrir boleto
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {role === "cliente" && !isPaid ? <MarkPaidButton invoiceId={inv.id} /> : null}

              {isPaid && inv.paid_at ? (
                <p className="text-xs text-chart-4">Pagamento confirmado em {formatDate(inv.paid_at)}.</p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
