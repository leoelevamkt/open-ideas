"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, AlertCircle, CheckCircle2 } from "lucide-react"

interface Hearing {
  id: number
  case_id: number | null
  title?: string
  hearing_date: string
  hearing_time?: string
  location?: string
  observations?: string
  notes?: string
  client_name?: string | null
  case?: {
    number?: string
    title?: string
    client?: {
      full_name?: string
    }
  }
}

interface DeadlineTimelineProps {
  hearings: Hearing[]
  role: string
}

export function DeadlineTimeline({ hearings, role }: DeadlineTimelineProps) {
  const now = new Date()
  
  const sortedHearings = [...hearings].sort((a, b) => {
    const dateA = new Date(a.hearing_date)
    const dateB = new Date(b.hearing_date)
    return dateA.getTime() - dateB.getTime()
  })

  const getStatus = (hearingDate: string) => {
    const date = new Date(hearingDate)
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: "passed", label: "Realizada" }
    if (daysUntil === 0) return { status: "today", label: "Hoje" }
    if (daysUntil <= 7) return { status: "urgent", label: `Em ${daysUntil} dia(s)` }
    if (daysUntil <= 30) return { status: "upcoming", label: `Em ${daysUntil} dias` }
    return { status: "future", label: `Em ${daysUntil} dias` }
  }

  if (hearings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma audiência agendada no momento.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sortedHearings.map((hearing, index) => {
        const { status, label } = getStatus(hearing.hearing_date)
        const date = new Date(hearing.hearing_date)
        const formattedDate = date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })

        return (
          <Card key={hearing.id} className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">
                      {hearing.title || (hearing.case?.number ? `Processo ${hearing.case.number}` : "Audiência")}
                    </CardTitle>
                    <Badge
                      variant={
                        status === "passed"
                          ? "secondary"
                          : status === "urgent"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {label}
                    </Badge>
                  </div>
                  {hearing.case?.title ? (
                    <CardDescription className="text-base font-medium text-foreground">
                      {hearing.case.title}
                    </CardDescription>
                  ) : null}
                  {role === "advogado" &&
                    (hearing.client_name || hearing.case?.client?.full_name) && (
                      <CardDescription className="mt-1 font-medium text-gold-strong">
                        Cliente: {hearing.client_name || hearing.case?.client?.full_name}
                      </CardDescription>
                    )}
                </div>
                {status === "passed" && <CheckCircle2 className="h-6 w-6 text-muted-foreground" />}
                {status === "urgent" && <AlertCircle className="h-6 w-6 text-destructive" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium capitalize">{formattedDate}</p>
                </div>
                {hearing.hearing_time && (
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">{hearing.hearing_time}</p>
                  </div>
                )}
                {hearing.location && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{hearing.location}</p>
                  </div>
                )}
              </div>
              {(hearing.observations || hearing.notes) && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{hearing.observations || hearing.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
