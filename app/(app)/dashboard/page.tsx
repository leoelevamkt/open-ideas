import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId } from "@/lib/queries"
import { LawyerDashboard } from "@/components/dashboard/lawyer-dashboard"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "advogado") {
    return <LawyerDashboard name={user.name} />
  }

  const client = await getClientByUserId(user.id)
  return <ClientDashboard name={user.name} clientId={client?.id ?? null} />
}
