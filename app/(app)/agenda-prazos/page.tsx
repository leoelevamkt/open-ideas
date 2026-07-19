import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId, getUpcomingHearings, getClientHearings } from "@/lib/queries"
import { DeadlineTimeline } from "@/components/deadline-timeline"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda de Prazos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.role === "advogado"
            ? "Visualize todas as audiências e prazos importantes."
            : "Acompanhe suas audiências e prazos processuais."}
        </p>
      </div>

      <DeadlineTimeline hearings={hearings} role={user.role} />
    </div>
  )
}
