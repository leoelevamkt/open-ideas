import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/agenda")({
  component: AgendaPage,
});

function AgendaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["hearings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hearings").select("*, cases(title, number)").order("hearing_date");
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Audiências</h2>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhuma audiência agendada.</p>}
      <ul className="divide-y border rounded-lg bg-card">
        {data?.map((h: any) => (
          <li key={h.id} className="p-4">
            <div className="font-medium">{h.title}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(h.hearing_date)} {h.hearing_time ?? ""} • {h.type}
            </div>
            {h.cases && <div className="text-xs text-muted-foreground">Processo: {h.cases.title}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
