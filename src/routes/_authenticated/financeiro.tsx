import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Wallet, CheckCircle2, Clock, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { PromoBanner } from "@/components/promo-banner";
import { StatCard } from "@/components/stat-card";
import { BankInfoCard } from "@/components/finance/bank-info-card";
import { BankInfoFormDialog } from "@/components/dialogs/bank-info-form-dialog";
import { InvoiceFormDialog } from "@/components/dialogs/invoice-form-dialog";
import { CopyButton } from "@/components/finance/copy-button";
import { getBankInfo, listInvoices, financeStats, setInvoiceStatus, deleteInvoice, getClientByUserId } from "@/lib/queries";
import { pageBanners } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, effectiveInvoiceStatus, invoiceStatusClass, invoiceStatusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/financeiro")({ component: FinanceiroPage });

function FinanceiroPage() {
  const { user } = useAuth();
  const isLawyer = user?.role === "advogado";
  const [clientId, setClientId] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data: bank } = useQuery({ queryKey: ["bank"], queryFn: getBankInfo });
  const { data: invoices = [] } = useQuery({
    enabled: !!user,
    queryKey: ["invoices", isLawyer, clientId],
    queryFn: () => listInvoices(isLawyer ? undefined : clientId ?? undefined),
  });
  const { data: stats } = useQuery({ enabled: isLawyer, queryKey: ["finance-stats"], queryFn: financeStats });

  async function markPaid(id: string) {
    try { await setInvoiceStatus(id, "pago"); toast.success("Marcado como pago."); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["finance-stats"] }); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Excluir este boleto?")) return;
    try { await deleteInvoice(id); toast.success("Boleto removido."); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["finance-stats"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Financeiro" subtitle="Boletos, PIX e dados bancários em um só lugar." />
      <PromoBanner banner={pageBanners.financeiro} />

      {isLawyer && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Clock} label="A receber" value={formatCurrency(stats.pending)} accent />
          <StatCard icon={Wallet} label="Boletos pendentes" value={stats.pendingCount} />
          <StatCard icon={CheckCircle2} label="Total recebido" value={formatCurrency(stats.received)} />
        </div>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Dados do escritório</h2>
          {isLawyer && <BankInfoFormDialog bank={bank} />}
        </div>
        <BankInfoCard bank={bank} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Boletos emitidos</h2>
          {isLawyer && <InvoiceFormDialog />}
        </div>
        <div className="flex flex-col gap-2">
          {invoices.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum boleto {isLawyer ? "emitido" : "no momento"}.</p>}
          {invoices.map((i: any) => {
            const eff = effectiveInvoiceStatus(i.status, i.due_date);
            return (
              <Card key={i.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.description}</p>
                      <p className="text-xs text-muted-foreground">Venc. {formatDate(i.due_date)}{i.client_name ? ` · ${i.client_name}` : ""}</p>
                      {i.case_title && <p className="truncate text-xs text-muted-foreground">Processo: {i.case_title}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg font-semibold">{formatCurrency(i.amount)}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${invoiceStatusClass(eff)}`}>{invoiceStatusLabel(eff)}</span>
                    </div>
                  </div>
                  {(i.pix_copy_paste || i.barcode || i.payment_link) && eff !== "pago" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {i.pix_copy_paste && <CopyButton value={i.pix_copy_paste} label="PIX copia e cola" />}
                      {i.barcode && <CopyButton value={i.barcode} label="Linha digitável" />}
                      {i.payment_link && <a href={i.payment_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"><ExternalLink className="size-3.5" /> Abrir boleto</a>}
                    </div>
                  )}
                  {isLawyer && (
                    <div className="mt-3 flex justify-end gap-2">
                      {eff !== "pago" && <Button variant="outline" size="sm" onClick={() => markPaid(i.id)}><CheckCircle2 className="mr-1 size-3.5" />Marcar pago</Button>}
                      <InvoiceFormDialog invoice={i} />
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete(i.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
