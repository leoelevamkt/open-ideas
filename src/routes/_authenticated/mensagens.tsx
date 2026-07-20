import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/mensagens")({
  component: MensagensPage,
});

function MensagensPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Mensagens</h2>
      {(data?.length ?? 0) === 0 && <p className="text-muted-foreground">Sem mensagens.</p>}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((m: any) => (
          <li key={m.id} className="p-4">
            <div className="text-sm">{m.body}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(m.created_at).toLocaleString("pt-BR")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
