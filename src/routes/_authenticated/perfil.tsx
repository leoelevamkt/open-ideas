import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, refresh } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_label ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ name, avatar_label: avatar })
      .eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Perfil atualizado"); void refresh(); }
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">Meu perfil</h2>
      <form onSubmit={save} className="space-y-4 bg-card border rounded-lg p-6">
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input value={profile?.email ?? ""} disabled className="w-full mt-1 border rounded-md px-3 py-2 bg-muted" />
        </div>
        <div>
          <label className="text-sm font-medium">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background" required />
        </div>
        <div>
          <label className="text-sm font-medium">Iniciais do avatar</label>
          <input value={avatar} maxLength={3} onChange={(e) => setAvatar(e.target.value.toUpperCase())}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-background" />
        </div>
        <button disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
