import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { BrandLogo } from "@/components/brand-logo"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background">
      {/* Cabeçalho de marca */}
      <section className="relative flex flex-col items-center gap-6 rounded-b-3xl bg-sidebar px-6 pb-10 pt-14 text-center text-sidebar-foreground safe-top">
        <BrandLogo variant="plate" className="h-20 px-5 py-3" priority />
        <div className="max-w-xs">
          <h1 className="text-balance text-xl font-semibold leading-snug">
            Seu processo, sempre na palma da mão.
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-sidebar-foreground/70">
            Acompanhe processos, audiências e documentos e fale direto com seu advogado.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="flex flex-1 flex-col justify-center px-5 py-8">
        <LoginForm />
      </section>

      <p className="px-6 pb-8 text-center text-xs text-muted-foreground safe-bottom">
        {`© ${new Date().getFullYear()} Guimarães & Guedes Advocacia.`}
      </p>
    </main>
  )
}
