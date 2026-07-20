import { redirect } from "next/navigation"
import { Wallet, Clock, CheckCircle2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import {
  financeStats,
  getBankInfo,
  getClientByUserId,
  listCases,
  listClients,
  listInvoices,
} from "@/lib/queries"
import { formatCurrency } from "@/lib/format"
import { StatCard } from "@/components/stat-card"
import { PageHero } from "@/components/page-hero"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"
import { BankInfoCard } from "@/components/finance/bank-info-card"
import { BankInfoFormDialog } from "@/components/finance/bank-info-form-dialog"
import { InvoiceFormDialog } from "@/components/finance/invoice-form-dialog"
import { InvoicesList } from "@/components/finance/invoices-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FinanceiroPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const bank = await getBankInfo()

  if (user.role === "advogado") {
    const invoices = await listInvoices()
    const clients = await listClients("ativo")
    const cases = await listCases()
    const stats = await financeStats()

    return (
      <div className="flex flex-col gap-6">
        <PageHero
          title="Financeiro"
          subtitle="Gerencie os dados bancários do escritório e emita boletos para os clientes."
        />

        <PromoBanner banner={pageBanners.financeiro} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="A receber (pendente)" value={formatCurrency(stats.pendingTotal)} icon={Clock} accent />
          <StatCard label="Boletos pendentes" value={stats.pendingCount} icon={Wallet} />
          <StatCard label="Total recebido" value={formatCurrency(stats.paidTotal)} icon={CheckCircle2} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Dados bancários do escritório</CardTitle>
            <BankInfoFormDialog bank={bank} />
          </CardHeader>
          <CardContent>
            <BankInfoCard bank={bank} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">Boletos emitidos</h2>
            <InvoiceFormDialog clients={clients} cases={cases} />
          </div>
          <InvoicesList invoices={invoices} role="advogado" clients={clients} cases={cases} />
        </div>
      </div>
    )
  }

  // ----- Visão do cliente -----
  const client = await getClientByUserId(user.id)
  const invoices = client ? await listInvoices(client.id) : []
  const stats = client ? await financeStats(client.id) : { pendingCount: 0, pendingTotal: 0, paidTotal: 0 }

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        title="Financeiro"
        subtitle="Consulte os dados bancários do escritório, acesse seus boletos e informe pagamentos."
      />

      <PromoBanner banner={pageBanners.financeiro} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Em aberto" value={formatCurrency(stats.pendingTotal)} icon={Clock} accent />
        <StatCard label="Boletos pendentes" value={stats.pendingCount} icon={Wallet} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Dados para pagamento</h2>
        <BankInfoCard bank={bank} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Meus boletos</h2>
        <InvoicesList invoices={invoices} role="cliente" />
      </section>
    </div>
  )
}
