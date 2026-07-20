import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Users, FolderKanban, CalendarClock, Bell, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile, role } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [clients, cases, hearings, notifs, docs] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("cases").select("id", { count: "exact", head: true }).neq("status", "Arquivado"),
        supabase.from("hearings").select("id", { count: "exact", head: true }),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ]);
      return {
        clients: clients.count ?? 0,
        cases: cases.count ?? 0,
        hearings: hearings.count ?? 0,
        notifications: notifs.count ?? 0,
        documents: docs.count ?? 0,
      };
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["dashboard-upcoming-hearings"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("hearings")
        .select("*, cases(title, number)")
        .gte("hearing_date", today)
        .order("hearing_date")
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentCases } = useQuery({
    queryKey: ["dashboard-recent-cases"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cases")
        .select("id, number, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Olá, {profile?.name?.split(" ")[0] ?? "usuário"}</h2>
        <p className="text-sm text-muted-foreground capitalize">Perfil: {role}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Clientes ativos" value={stats?.clients ?? 0} to="/clientes" />
        <StatCard icon={FolderKanban} label="Processos ativos" value={stats?.cases ?? 0} to="/processos" />
        <StatCard icon={CalendarClock} label="Audiências" value={stats?.hearings ?? 0} to="/agenda" />
        <StatCard icon={FileText} label="Documentos" value={stats?.documents ?? 0} to="/documentos" />
        <StatCard icon={Bell} label="Não lidas" value={stats?.notifications ?? 0} to="/notificacoes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Próximas audiências</h3>
            <Link to="/agenda" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          {!upcoming?.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((h: any) => (
                <li key={h.id} className="py-2 text-sm flex justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{h.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {h.cases?.number ? `${h.cases.number} — ` : ""}{h.cases?.title ?? h.location ?? "—"}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {h.hearing_date} {h.hearing_time ?? ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Processos recentes</h3>
            <Link to="/processos" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {!recentCases?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum processo cadastrado.</p>
          ) : (
            <ul className="divide-y">
              {recentCases.map((c: any) => (
                <li key={c.id} className="py-2 text-sm">
                  <Link to="/processos/$id" params={{ id: c.id }} className="flex justify-between gap-2 hover:bg-muted/50 -mx-2 px-2 py-1 rounded">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.number}</div>
                    </div>
                    <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 whitespace-nowrap self-start">
                      {c.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: any; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className="size-4" /> {label}
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
