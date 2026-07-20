import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Case } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/processos")({
  component: ProcessosPage,
});

function ProcessosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Case[];
    },
  });
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Processos</h2>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhum processo ainda.</p>}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((c) => (
          <li key={c.id} className="p-4">
            <div className="font-medium">{c.title}</div>
            <div className="text-sm text-muted-foreground">Nº {c.number} • {c.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
