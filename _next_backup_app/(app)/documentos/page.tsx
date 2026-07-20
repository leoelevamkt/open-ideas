import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, listCases, listClients, listDocuments } from "@/lib/queries"
import { DocumentsView } from "@/components/documents/documents-view"
import { DocumentFormDialog } from "@/components/documents/document-form-dialog"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"

export default async function DocumentosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    const documents = await listDocuments()
    const clients = await listClients("ativo")
    const cases = await listCases()
    return (
      <div className="flex flex-col gap-5">
        <PromoBanner banner={pageBanners.documentos} priority />
        <div className="flex justify-end">
          <DocumentFormDialog clients={clients} cases={cases} />
        </div>
        <DocumentsView documents={documents} role="advogado" />
      </div>
    )
  }

  const client = await getClientByUserId(user.id)
  const documents = client ? await listDocuments({ clientId: client.id }) : []

  return (
    <div className="flex flex-col gap-6">
      <PromoBanner banner={pageBanners.documentos} priority />
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-refined">Documentos</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Envie documentos solicitados e visualize os compartilhados pelo escritório.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {client && <DocumentUploadForm clientId={client.id} />}
        <DocumentsView documents={documents} role="cliente" />
      </div>
    </div>
  )
}
