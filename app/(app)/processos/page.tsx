import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, listCases, listCasesWithClient, listClients } from "@/lib/queries"
import { CasesList } from "@/components/cases/cases-list"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"

export default async function ProcessosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    const cases = await listCasesWithClient()
    const clients = await listClients("ativo")
    return (
      <div className="flex flex-col gap-5">
        <PromoBanner banner={pageBanners.processos} priority />
        <CasesList cases={cases} clients={clients} role="advogado" />
      </div>
    )
  }

  const client = await getClientByUserId(user.id)
  const cases = client ? await listCases(client.id) : []
  return (
    <div className="flex flex-col gap-5">
      <PromoBanner banner={pageBanners.processos} priority />
      <CasesList cases={cases} clients={[]} role="cliente" />
    </div>
  )
}
