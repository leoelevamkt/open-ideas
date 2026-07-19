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
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name, role },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativada.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na autenticação";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <BrandLogo />
          <h1 className="text-2xl font-semibold mt-4">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground">Portal Jurídico</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="text-sm font-medium">Nome</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Você é</label>
                <select
                  value={role} onChange={(e) => setRole(e.target.value as "advogado" | "cliente")}
                  className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                >
                  <option value="cliente">Cliente</option>
                  <option value="advogado">Advogado</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
            />
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 font-medium disabled:opacity-50"
          >
            {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <button className="text-primary" onClick={() => setMode("signup")}>Não tem conta? Criar</button>
          ) : (
            <button className="text-primary" onClick={() => setMode("login")}>Já tem conta? Entrar</button>
          )}
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          <Link to="/">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}
