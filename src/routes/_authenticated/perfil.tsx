import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, role } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name ?? "");

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const avatar = name.slice(0, 2).toUpperCase();
      const { error } = await supabase.from("profiles").update({ name, avatar_label: avatar }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold">Meu perfil</h2>

      <div className="flex items-center gap-4">
        <span className="size-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">
          {profile?.avatar_label ?? name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="font-medium">{profile?.email}</div>
          <div className="text-sm text-muted-foreground capitalize">Perfil: {role}</div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-5">
        <div>
          <label className="text-xs text-muted-foreground">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">E-mail</label>
          <input value={profile?.email ?? ""} disabled className="mt-1 w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground" />
        </div>
        <button onClick={() => save.mutate()} disabled={!name || save.isPending} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-50">
          {save.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-destructive text-destructive px-3 py-2 text-sm hover:bg-destructive/10">
        <LogOut className="size-4" /> Sair
      </button>
    </div>
  );
}
