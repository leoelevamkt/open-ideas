import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, listCases, listClients, listHearings } from "@/lib/queries"

import { AgendaView } from "@/components/hearings/agenda-view"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"

export default async function AgendaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    const hearings = await listHearings()
    const cases = await listCases()
    const clients = await listClients("ativo")
    return (
      <div className="flex flex-col gap-5">
        <PromoBanner banner={pageBanners.agenda} priority />
        <AgendaView hearings={hearings} cases={cases} clients={clients} role="advogado" />
      </div>
    )
  }

  const client = await getClientByUserId(user.id)
  const hearings = client ? await listHearings(client.id) : []
  return (
    <div className="flex flex-col gap-5">
      <PromoBanner banner={pageBanners.agenda} priority />
      <AgendaView hearings={hearings} cases={[]} role="cliente" />
    </div>
  )
}
