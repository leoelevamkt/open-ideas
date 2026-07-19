import Link from "next/link"
import { Users, Briefcase, CalendarClock, FileWarning, ArrowRight } from "lucide-react"
import {
  lawyerStats,
  listHearings,
  recentMovements,
} from "@/lib/queries"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime, relativeDate } from "@/lib/format"

export async function LawyerDashboard({ name }: { name: string }) {
  const stats = await lawyerStats()
  const upcoming = (await listHearings()).slice(0, 4)
  const movements = await recentMovements(5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-balance text-xl font-semibold text-foreground">
          {`Bem-vinda, ${name.split(" ").slice(0, 2).join(" ")}`}
        </h2>
        <p className="text-sm text-muted-foreground">Visão geral do seu escritório.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes ativos" value={stats.clients} icon={Users} />
        <StatCard label="Processos" value={stats.cases} icon={Briefcase} />
        <StatCard label="Audiências (7 dias)" value={stats.hearingsWeek} icon={CalendarClock} accent />
        <StatCard label="Documentos pendentes" value={stats.pendingDocs} icon={FileWarning} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Próximas audiências</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/agenda" />}>
              Ver agenda <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p>
            ) : (
              upcoming.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.case_title ?? "Sem processo"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-foreground">{formatDate(h.hearing_date)}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(h.hearing_time)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Movimentações recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            ) : (
              movements.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.case_title} · {relativeDate(m.event_date)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
