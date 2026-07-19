import Link from "next/link"
import { Briefcase, FileWarning, CalendarClock, Megaphone, ArrowRight } from "lucide-react"
import {
  clientStats,
  getNextHearing,
  lastMovement,
  listCases,
} from "@/lib/queries"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime, relativeDate } from "@/lib/format"

export async function ClientDashboard({ name, clientId }: { name: string; clientId: number | null }) {
  if (!clientId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {`Olá, ${name}. Ainda não há um cadastro de cliente vinculado à sua conta. Entre em contato com seu advogado.`}
        </CardContent>
      </Card>
    )
  }

  const stats = await clientStats(clientId)
  const nextHearing = await getNextHearing(clientId)
  const movement = await lastMovement(clientId)
  const cases = await listCases(clientId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-balance text-xl font-semibold text-foreground">
          {`Olá, ${name.split(" ")[0]}`}
        </h2>
        <p className="text-sm text-muted-foreground">Acompanhe o andamento dos seus processos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Processos ativos" value={stats.activeCases} icon={Briefcase} />
        <StatCard
          label="Próxima audiência"
          value={nextHearing ? formatDate(nextHearing.hearing_date) : "—"}
          hint={nextHearing ? `${formatTime(nextHearing.hearing_time)} · ${nextHearing.type}` : "Nenhuma agendada"}
          icon={CalendarClock}
          accent
        />
        <StatCard label="Documentos pendentes" value={stats.pendingDocs} icon={FileWarning} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Megaphone className="h-4 w-4 text-accent-foreground" />
            <CardTitle className="text-base">Última movimentação</CardTitle>
          </CardHeader>
          <CardContent>
            {movement ? (
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">{movement.title}</p>
                {movement.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{movement.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {movement.case_title} · {relativeDate(movement.event_date)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Meus processos</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/processos" />}>
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
            ) : (
              cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/processos/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.number}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
