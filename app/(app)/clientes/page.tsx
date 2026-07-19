import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { listClients } from "@/lib/queries"
import { ClientsList } from "@/components/clients/clients-list"

export default async function ClientesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "advogado") redirect("/dashboard")

  const clients = await listClients()
  return <ClientsList clients={clients} />
}
