import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, getUpcomingHearings, getClientHearings } from "@/lib/queries"
import { DeadlineTimeline } from "@/components/deadline-timeline"
import { PromoBanner } from "@/components/promo-banner"
import { pageBanners } from "@/lib/banners"

export default async function AgendaPrazosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let hearings: any[] = []

  if (user.role === "advogado") {
    hearings = await getUpcomingHearings()
  } else {
    const client = await getClientByUserId(user.id)
    if (client) {
      hearings = await getClientHearings(client.id, "proximashearing")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PromoBanner banner={pageBanners.agenda} priority />
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-refined">Agenda de Prazos</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {user.role === "advogado"
            ? "Visualize todas as audiências e prazos importantes."
            : "Acompanhe suas audiências e prazos processuais."}
        </p>
      </div>

      <DeadlineTimeline hearings={hearings} role={user.role} />
    </div>
  )
}
