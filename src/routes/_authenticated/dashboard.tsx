import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, FolderKanban, CalendarClock, Wallet, FileText, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { BannerCarousel } from "@/components/banner-carousel";
import { StatCard } from "@/components/stat-card";
import { lawyerBanners, clientBanners } from "@/lib/constants";
import { lawyerStats, clientStats, getClientByUserId, getUpcomingHearings, listRecentTimeline } from "@/lib/queries";
import { formatCurrency, formatDate, relativeDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const isLawyer = user?.role === "advogado";

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data: stats } = useQuery({
    enabled: !!user,
    queryKey: ["dashboard-stats", user?.id, isLawyer, clientId],
    queryFn: async () => isLawyer ? await lawyerStats() : (clientId ? await clientStats(clientId) : { activeCases: 0, pendingDocs: 0 }),
  });
  const { data: upcoming = [] } = useQuery({ enabled: !!user && isLawyer, queryKey: ["upcoming-h"], queryFn: () => getUpcomingHearings(4) });
  const { data: timeline = [] } = useQuery({ enabled: !!user && isLawyer, queryKey: ["recent-t"], queryFn: () => listRecentTimeline(5) });

  const firstName = user?.name?.split(" ")[0] ?? "";
  const greeting = isLawyer ? `Bem-vindo, Dr. ${firstName}` : `Olá, ${firstName}`;

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-topline relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm ring-1 ring-gold/15">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-col gap-2">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-5 bg-gold" /> Guimarães & Guedes
          </span>
          <h1 className="font-heading text-2xl font-semibold leading-snug tracking-refined">{greeting}</h1>
          <p className="text-sm text-sidebar-foreground/70">
            {isLawyer ? "Panorama do escritório em tempo real." : "Acompanhe seus processos com transparência."}
          </p>
        </div>
      </section>

      <BannerCarousel banners={isLawyer ? lawyerBanners : clientBanners} />

      {isLawyer && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} label="Clientes ativos" value={(stats as any).clients} />
          <StatCard icon={FolderKanban} label="Processos" value={(stats as any).cases} />
          <StatCard icon={CalendarClock} label="Audiências (7d)" value={(stats as any).hearingsWeek} />
          <StatCard icon={Wallet} label="A receber" value={formatCurrency((stats as any).pendingAmount)} accent />
        </div>
      )}
      {!isLawyer && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={FolderKanban} label="Processos ativos" value={(stats as any).activeCases} />
          <StatCard icon={FileText} label="Docs pendentes" value={(stats as any).pendingDocs} />
        </div>
      )}

      {isLawyer && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="size-4 text-gold-strong" /> Próximas audiências</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p>}
              {upcoming.map((h: any) => (
                <div key={h.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(h.hearing_date)}{h.hearing_time ? ` · ${h.hearing_time.slice(0,5)}` : ""}</p>
                    {h.case_title && <p className="truncate text-xs text-muted-foreground">{h.case_title}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-strong">{h.type}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock className="size-4 text-gold-strong" /> Movimentações recentes</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {timeline.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma movimentação recente.</p>}
              {timeline.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 border-l-2 border-gold/60 pl-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.case_title && <p className="truncate text-xs text-muted-foreground">{t.case_title}</p>}
                    <p className="text-xs text-muted-foreground">{relativeDate(t.event_date)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
