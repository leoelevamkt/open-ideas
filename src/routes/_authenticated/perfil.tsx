import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user; if (!u) return;
      setId(u.id); setEmail(u.email ?? "");
      const { data } = await supabase.from("profiles").select("name").eq("id", u.id).maybeSingle();
      setName((data as any)?.name ?? "");
    })();
  }, []);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Perfil atualizado");
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Meu Perfil</h1>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Dados pessoais</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>E-mail</Label><Input value={email} disabled /></div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
            <Button variant="outline" onClick={signOut}>Sair</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
