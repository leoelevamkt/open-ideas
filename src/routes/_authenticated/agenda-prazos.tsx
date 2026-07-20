import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/agenda-prazos")({
  component: AgendaPrazosPage,
});

function AgendaPrazosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["timeline-events-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*, cases(title, number)")
        .order("event_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const arr = data ?? [];
    return {
      overdue: arr.filter((e: any) => e.event_date < today),
      soon: arr.filter((e: any) => e.event_date >= today && e.event_date <= in7),
      later: arr.filter((e: any) => e.event_date > in7),
    };
  }, [data, today, in7]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Agenda de Prazos</h2>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      <Group icon={AlertTriangle} tone="destructive" title="Atrasados" items={groups.overdue} />
      <Group icon={Clock} tone="warn" title="Próximos 7 dias" items={groups.soon} />
      <Group icon={CheckCircle2} tone="muted" title="Mais adiante" items={groups.later} />
    </div>
  );
}

function Group({ icon: Icon, tone, title, items }: { icon: any; tone: "destructive" | "warn" | "muted"; title: string; items: any[] }) {
  const toneCls = tone === "destructive" ? "text-destructive" : tone === "warn" ? "text-amber-600" : "text-muted-foreground";
  return (
    <section>
      <h3 className={`font-semibold mb-2 flex items-center gap-2 ${toneCls}`}><Icon className="size-4" /> {title} <span className="text-xs text-muted-foreground">({items.length})</span></h3>
      {!items.length ? <p className="text-sm text-muted-foreground">Nada aqui.</p> : (
        <ul className="divide-y border rounded-lg bg-card">
          {items.map((e: any) => (
            <li key={e.id} className="p-3 flex justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {e.cases?.number ? `${e.cases.number} — ${e.cases.title}` : "—"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap self-center">{e.event_date}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
