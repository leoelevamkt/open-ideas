import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("full_name");
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Clientes</h2>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((c) => (
          <li key={c.id} className="p-4">
            <div className="font-medium">{c.full_name}</div>
            <div className="text-sm text-muted-foreground">{c.email ?? "—"} • {c.phone ?? "—"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
