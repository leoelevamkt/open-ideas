import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Scale, Building2, MapPin, User as UserIcon, FileText } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getCase, getClient, getClientByUserId, listClients, listDocuments, listTimeline } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { CaseFormDialog } from "@/components/cases/case-form-dialog"
import { AddTimelineDialog } from "@/components/cases/add-timeline-dialog"
import { formatDate } from "@/lib/format"

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params
  const caseItem = await getCase(Number(id))
  if (!caseItem) notFound()

  const isLawyer = user.role === "advogado"
  // Cliente só pode ver seus próprios processos
  if (!isLawyer) {
    const client = await getClientByUserId(user.id)
    if (!client || caseItem.client_id !== client.id) redirect("/processos")
  }

  const timeline = await listTimeline(caseItem.id)
  const documents = await listDocuments({ caseId: caseItem.id })
  const client = caseItem.client_id ? await getClient(caseItem.client_id) : null
  const clients = isLawyer ? await listClients("ativo") : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/processos" />}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
        </Button>
        {isLawyer ? <CaseFormDialog caseItem={caseItem} clients={clients} /> : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-balance text-lg">{caseItem.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{caseItem.number}</p>
            </div>
            <StatusBadge status={caseItem.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info icon={Scale} label="Área / Tipo" value={[caseItem.legal_area, caseItem.action_type].filter(Boolean).join(" · ")} />
          <Info icon={Building2} label="Tribunal" value={[caseItem.court, caseItem.court_division].filter(Boolean).join(" · ")} />
          <Info icon={MapPin} label="Comarca" value={caseItem.district} />
          <Info icon={UserIcon} label="Autor" value={caseItem.plaintiff} />
          <Info icon={UserIcon} label="Réu" value={caseItem.defendant} />
          <Info icon={UserIcon} label="Advogado" value={caseItem.lawyer_name} />
          {client ? <Info icon={UserIcon} label="Cliente" value={client.full_name} /> : null}
        </CardContent>
        {caseItem.description ? (
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <p className="text-sm text-muted-foreground">{caseItem.description}</p>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Linha do tempo</CardTitle>
            {isLawyer ? <AddTimelineDialog caseId={caseItem.id} /> : null}
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
            ) : (
              <ol className="relative ml-3 border-l border-border">
                {timeline.map((t) => (
                  <li key={t.id} className="mb-6 ml-6 last:mb-0">
                    <span className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-accent" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(t.event_date)}</span>
                    </div>
                    {t.description ? <p className="mt-1 text-sm text-muted-foreground">{t.description}</p> : null}
                    {t.responsible ? (
                      <p className="mt-1 text-xs text-muted-foreground">Responsável: {t.responsible}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum documento.</p>
            ) : (
              documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm text-foreground">{d.name}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Scale
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  )
}
