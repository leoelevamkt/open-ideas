import { redirect } from "next/navigation"
import { Users, Briefcase, CalendarClock, FileText } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import {
  casesByStatus,
  clientStats,
  getClientByUserId,
  hearingsThisMonth,
  lawyerStats,
  listCases,
  listDocuments,
} from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { CasesByStatusChart } from "@/components/reports/cases-by-status-chart"
import { formatDate } from "@/lib/format"

export default async function RelatoriosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role !== "advogado") {
    const client = await getClientByUserId(user.id)
    if (!client) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum dado disponível.
          </CardContent>
        </Card>
      )
    }
    const stats = await clientStats(client.id)
    const cases = await listCases(client.id)
    const docs = await listDocuments({ clientId: client.id })
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Processos ativos" value={stats.activeCases} icon={Briefcase} />
          <StatCard label="Total de processos" value={cases.length} icon={Briefcase} accent />
          <StatCard label="Documentos" value={docs.length} icon={FileText} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo dos meus processos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cases.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <span className="truncate text-sm text-foreground">{c.title}</span>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = await lawyerStats()
  const byStatus = await casesByStatus()
  const monthHearings = await hearingsThisMonth()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes ativos" value={stats.clients} icon={Users} />
        <StatCard label="Processos" value={stats.cases} icon={Briefcase} />
        <StatCard label="Audiências (mês)" value={monthHearings.length} icon={CalendarClock} accent />
        <StatCard label="Documentos pendentes" value={stats.pendingDocs} icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processos por status</CardTitle>
        </CardHeader>
        <CardContent>
          {byStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <CasesByStatusChart data={byStatus} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audiências do mês</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {monthHearings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma audiência neste mês.</p>
          ) : (
            monthHearings.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{h.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.case_title ?? "Sem processo"}</p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">{formatDate(h.hearing_date)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
