import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { data } = useQuery({
    queryKey: ["reports-cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("status");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const c of data ?? []) counts[c.status] = (counts[c.status] ?? 0) + 1;
      return counts;
    },
  });
  const entries = Object.entries(data ?? {});
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Relatórios</h2>
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Processos por status</h3>
        {total === 0 && <p className="text-muted-foreground text-sm">Sem dados ainda.</p>}
        <div className="space-y-3">
          {entries.map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between text-sm mb-1">
                <span>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
