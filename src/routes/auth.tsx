import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"advogado" | "cliente">("cliente");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo(a)!");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name, role },
          },
        });
        if (error) throw error;
        toast.success("Conta criada!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na autenticação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-ambient">
      <main className="app-frame flex min-h-[100dvh] flex-col bg-background">
        {/* Cabeçalho de marca */}
        <section className="relative flex flex-col items-center gap-6 rounded-b-3xl bg-sidebar px-6 pb-10 pt-14 text-center text-sidebar-foreground safe-top">
          <BrandLogo variant="plate" className="h-20 px-5 py-3" />
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
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-foreground">
                {mode === "login" ? "Acessar plataforma" : "Criar conta"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login" ? "Entre com suas credenciais para continuar." : "Preencha seus dados para começar."}
              </p>

              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                {mode === "signup" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Nome</label>
                      <input
                        required value={name} onChange={(e) => setName(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Você é</label>
                      <select
                        value={role} onChange={(e) => setRole(e.target.value as "advogado" | "cliente")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="advogado">Advogado(a)</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Senha</label>
                  <input
                    type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="h-10 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
                </button>
              </form>

              <div className="mt-4 text-center text-sm">
                {mode === "login" ? (
                  <button className="text-foreground underline underline-offset-4" onClick={() => setMode("signup")}>
                    Não tem conta? Criar
                  </button>
                ) : (
                  <button className="text-foreground underline underline-offset-4" onClick={() => setMode("login")}>
                    Já tem conta? Entrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <p className="px-6 pb-8 text-center text-xs text-muted-foreground safe-bottom">
          © {new Date().getFullYear()} Guimarães & Guedes Advocacia.{" "}
          <Link to="/" className="underline underline-offset-2">Início</Link>
        </p>
      </main>
    </div>
  );
}
