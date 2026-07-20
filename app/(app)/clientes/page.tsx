import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { listClients } from "@/lib/queries"
import { ClientsList } from "@/components/clients/clients-list"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"

export default async function ClientesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "advogado") redirect("/dashboard")

  const clients = await listClients()
  return (
    <div className="flex flex-col gap-5">
      <PromoBanner banner={pageBanners.clientes} priority />
      <ClientsList clients={clients} />
    </div>
  )
}
