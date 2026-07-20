import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getClient, listCases, listDocuments } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { formatDate } from "@/lib/format"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "advogado") redirect("/dashboard")

  const { id } = await params
  const client = await getClient(Number(id))
  if (!client) notFound()

  const cases = await listCases(client.id)
  const documents = await listDocuments({ clientId: client.id })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/clientes" />}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
        </Button>
        <ClientFormDialog client={client} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-balance text-lg">{client.full_name}</CardTitle>
              <StatusBadge status={client.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Info label="CPF / CNPJ" value={client.cpf} />
            <Info label="RG" value={client.rg} />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> {client.birth_date ? formatDate(client.birth_date) : "—"}
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {client.phone ?? "—"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> <span className="break-all">{client.email ?? "—"}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {client.address ?? "—"}
            </div>
            {client.notes ? (
              <>
                <Separator />
                <p className="text-muted-foreground">{client.notes}</p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processos ({cases.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {cases.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum processo vinculado.</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentos ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum documento.</p>
              ) : (
                documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.category}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value ?? "—"}</span>
    </div>
  )
}
