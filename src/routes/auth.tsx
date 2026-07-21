import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo(a)!");
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { name } },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, name, email });
        }
        toast.success("Conta criada!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background">
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

      <section className="flex flex-1 flex-col justify-center px-5 py-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Acessar plataforma" : "Criar conta"}
            </CardTitle>
            <CardDescription>
              {mode === "login" ? "Entre com suas credenciais para continuar." : "Cadastre-se para acessar o portal."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              {mode === "signup" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>
              <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
              </button>
            </form>
          </CardContent>
        </Card>
      </section>

      <p className="px-6 pb-8 text-center text-xs text-muted-foreground safe-bottom">
        © {new Date().getFullYear()} Guimarães & Guedes Advocacia.
      </p>
    </main>
  );
}
