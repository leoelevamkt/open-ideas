import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, listCases, listHearings } from "@/lib/queries"

import { AgendaView } from "@/components/hearings/agenda-view"

export default async function AgendaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    const hearings = await listHearings()
    const cases = await listCases()
    return <AgendaView hearings={hearings} cases={cases} role="advogado" />
  }

  const client = await getClientByUserId(user.id)
  const hearings = client ? await listHearings(client.id) : []
  return <AgendaView hearings={hearings} cases={[]} role="cliente" />
}
