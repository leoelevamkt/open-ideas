import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { CalendarClock, MapPin, User, Scale } from "lucide-react";
import { listHearings, getClientByUserId } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { PageHero } from "@/components/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/agenda-prazos")({
  component: PrazosPage,
});

const TYPE_FILTERS = ["todos", "Audiência", "Prazo", "Reunião", "Diligência"] as const;

function bucketLabel(dateStr: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff <= 7) return "Próximos 7 dias";
  if (diff <= 30) return "Este mês";
  return "Mais adiante";
}

function typeColor(t?: string | null) {
  if (t === "Audiência") return "bg-blue-100 text-blue-700";
  if (t === "Prazo") return "bg-red-100 text-red-700";
  if (t === "Reunião") return "bg-emerald-100 text-emerald-700";
  if (t === "Diligência") return "bg-amber-100 text-amber-700";
  return "bg-muted text-muted-foreground";
}

function PrazosPage() {
  const { user, isStaff } = useAuth();
  const isLawyer = isStaff;
  const [clientId, setClientId] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof TYPE_FILTERS)[number]>("todos");

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data = [] } = useQuery({
    enabled: !!user,
    queryKey: ["hearings-all", isLawyer, clientId],
    queryFn: () => listHearings(isLawyer ? undefined : clientId ?? undefined),
  });

  const today = new Date().toISOString().slice(0, 10);
  const grouped = useMemo(() => {
    const upcoming = data
      .filter((h: any) => h.hearing_date >= today)
      .filter((h: any) => filter === "todos" || h.type === filter)
      .sort((a: any, b: any) =>
        a.hearing_date === b.hearing_date
          ? (a.hearing_time ?? "").localeCompare(b.hearing_time ?? "")
          : a.hearing_date.localeCompare(b.hearing_date),
      );
    const buckets: Record<string, any[]> = {};
    for (const h of upcoming) {
      const b = bucketLabel(h.hearing_date);
      (buckets[b] ??= []).push(h);
    }
    return buckets;
  }, [data, filter, today]);

  const order = ["Hoje", "Amanhã", "Próximos 7 dias", "Este mês", "Mais adiante"];
  const isEmpty = Object.keys(grouped).length === 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Agenda de Prazos" subtitle="Próximos compromissos organizados por data." />

      <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {TYPE_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t === "todos" ? "Todos" : t}
          </button>
        ))}
      </div>

      {isEmpty && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarClock className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum prazo ou compromisso futuro.</p>
          </CardContent>
        </Card>
      )}

      {order.filter(k => grouped[k]?.length).map(bucket => (
        <section key={bucket} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">{bucket}</h2>
            <span className="text-xs text-muted-foreground">· {grouped[bucket].length}</span>
          </div>
          {grouped[bucket].map((h: any) => {
            const d = new Date(h.hearing_date + "T00:00:00");
            return (
              <Card key={h.id} className="transition hover:border-gold/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-[10px] font-medium uppercase leading-none">
                        {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="text-lg font-bold leading-none">{d.getDate().toString().padStart(2, "0")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{h.title}</p>
                        <Badge className={typeColor(h.type)} variant="secondary">{h.type}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3" />
                          {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                          {h.hearing_time ? ` · ${h.hearing_time.slice(0, 5)}` : ""}
                        </span>
                        {h.location && (
                          <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{h.location}</span>
                        )}
                        {h.case_title && (
                          <span className="inline-flex items-center gap-1"><Scale className="size-3" />{h.case_title}</span>
                        )}
                        {isLawyer && h.client_name && (
                          <span className="inline-flex items-center gap-1"><User className="size-3" />{h.client_name}</span>
                        )}
                      </div>
                      {h.notes && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{h.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ))}
    </div>
  );
}
