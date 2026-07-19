import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getClientByUserId } from "@/lib/queries"
import { ProfileForm } from "@/components/profile-form"

export default async function PerfilPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  let clientData = null
  if (user.role === "cliente") {
    const client = await getClientByUserId(user.id)
    if (client) {
      clientData = {
        cpf: client.cpf,
        rg: client.rg,
        birthDate: client.birth_date,
        phone: client.phone,
        whatsapp: client.whatsapp,
        address: client.address,
        notes: client.notes,
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">Gerencie suas informações pessoais e configurações de segurança.</p>
      </div>

      <ProfileForm userData={{ name: user.name, email: user.email }} clientData={clientData ?? undefined} role={user.role} />
    </div>
  )
}
