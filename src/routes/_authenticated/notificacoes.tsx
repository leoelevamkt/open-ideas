import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Bell, Check, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Todas marcadas como lidas");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unread = (data ?? []).filter((n: any) => !n.read).length;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Notificações {unread > 0 && <span className="text-sm text-muted-foreground">({unread} não lidas)</span>}</h2>
        {unread > 0 && (
          <button onClick={() => markAllRead.mutate()} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">
            <CheckCheck className="size-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> :
        !data?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="size-10 mx-auto mb-2 opacity-40" />
            <p>Nenhuma notificação.</p>
          </div>
        ) : (
        <ul className="divide-y border rounded-lg bg-card">
          {data.map((n: any) => (
            <li key={n.id} className={`p-4 flex gap-3 ${!n.read ? "bg-primary/5" : ""}`}>
              <div className={`size-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(n.created_at).toLocaleString("pt-BR")}</span>
                </div>
                {n.description && <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5">{n.type}</span>
                  {!n.read && (
                    <button onClick={() => markRead.mutate(n.id)} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      <Check className="size-3" /> Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
