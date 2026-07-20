import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications").select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Notificações</h2>
      {(data?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhuma notificação.</p>}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((n: any) => (
          <li key={n.id} className={`p-4 ${!n.read ? "bg-primary/5" : ""}`}
              onClick={() => !n.read && markRead.mutate(n.id)}>
            <div className="font-medium">{n.title}</div>
            {n.description && <div className="text-sm text-muted-foreground">{n.description}</div>}
            <div className="text-xs text-muted-foreground mt-1">{relativeTime(n.created_at)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
