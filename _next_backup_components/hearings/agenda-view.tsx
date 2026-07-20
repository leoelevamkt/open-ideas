"use client"

import { MapPin, Video, Clock, Link2, Trash2, User } from "lucide-react"
import type { Case, Client, Hearing, Role } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HearingFormDialog } from "@/components/hearings/hearing-form-dialog"
import { deleteHearingAction } from "@/lib/actions"
import { formatDate, formatTime, toDateInputValue } from "@/lib/format"

type HearingItem = Hearing & { case_title: string | null; client_name: string | null }

function HearingCard({
  h,
  cases,
  clients,
  role,
}: {
  h: HearingItem
  cases: Case[]
  clients: Client[]
  role: Role
}) {
  const dateStr = toDateInputValue(h.hearing_date)
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="text-lg font-semibold leading-none">{dateStr.slice(8, 10)}</span>
            <span className="text-xs uppercase">
              {new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" })}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{h.title}</p>
              <Badge variant="outline" className="gap-1">
                {h.type === "Online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {h.type}
              </Badge>
            </div>
            {h.client_name ? (
              <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-gold-strong">
                <User className="h-3.5 w-3.5" /> {h.client_name}
              </p>
            ) : null}
            {h.case_title ? <p className="mt-0.5 text-sm text-muted-foreground">{h.case_title}</p> : null}
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDate(h.hearing_date)} · {formatTime(h.hearing_time)}
              </span>
              {h.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {h.location}
                </span>
              ) : null}
              {h.link ? (
                <a href={h.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <Link2 className="h-3 w-3" /> Acessar sala
                </a>
              ) : null}
            </div>
          </div>
        </div>
        {role === "advogado" ? (
          <div className="flex shrink-0 items-center gap-2">
            <HearingFormDialog hearing={h} cases={cases} clients={clients} />
            <form action={deleteHearingAction}>
              <input type="hidden" name="id" value={h.id} />
              <Button type="submit" variant="ghost" size="icon" aria-label="Excluir audiência">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function AgendaView({
  hearings,
  cases,
  clients = [],
  role,
}: {
  hearings: HearingItem[]
  cases: Case[]
  clients?: Client[]
  role: Role
}) {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = hearings.filter((h) => toDateInputValue(h.hearing_date) >= today)
  const past = hearings.filter((h) => toDateInputValue(h.hearing_date) < today)

  return (
    <div className="flex flex-col gap-6">
      {role === "advogado" ? (
        <div className="flex justify-end">
          <HearingFormDialog cases={cases} clients={clients} />
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Próximas audiências</h3>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma audiência agendada.
            </CardContent>
          </Card>
        ) : (
          upcoming.map((h) => <HearingCard key={h.id} h={h} cases={cases} clients={clients} role={role} />)
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Realizadas</h3>
          <div className="flex flex-col gap-3 opacity-70">
            {past.map((h) => (
              <HearingCard key={h.id} h={h} cases={cases} clients={clients} role={role} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
