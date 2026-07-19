import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, listCases, listClients, listDocuments } from "@/lib/queries"
import { DocumentsView } from "@/components/documents/documents-view"
import { DocumentFormDialog } from "@/components/documents/document-form-dialog"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"

export default async function DocumentosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    const documents = await listDocuments()
    const clients = await listClients("ativo")
    const cases = await listCases()
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <DocumentFormDialog clients={clients} cases={cases} />
        </div>
        <DocumentsView documents={documents} role="advogado" />
      </div>
    )
  }

  const client = await getClientByUserId(user.id)
  const documents = client ? await listDocuments({ clientId: client.id }) : []
  const cases = client ? await listCases(client.id) : []
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Envie documentos solicitados e visualize os compartilhados pelo escritório.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {client && <DocumentUploadForm clientId={client.id} />}
        </div>
        <div className="lg:col-span-2">
          <DocumentsView documents={documents} role="cliente" />
        </div>
      </div>
    </div>
  )
}
