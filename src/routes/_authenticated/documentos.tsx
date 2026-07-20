import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/documentos")({
  component: DocumentosPage,
});

function DocumentosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Documentos</h2>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhum documento.</p>}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((d: any) => (
          <li key={d.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-muted-foreground">{d.category} • {formatDate(d.created_at)}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${d.status === "pendente" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {d.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
