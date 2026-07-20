import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, CalendarClock, FileText } from "lucide-react";
import { lawyerStats, clientStats, getClientByUserId } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [role, setRole] = useState<"advogado" | "cliente" | null>(null);
  const [name, setName] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user;
      if (!u) return;
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", u.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.id).maybeSingle(),
      ]);
      const roleValue = ((r as any)?.role ?? "cliente") as "advogado" | "cliente";
      setRole(roleValue);
      setName((p as any)?.name ?? u.email ?? "");
      if (roleValue === "advogado") {
        setStats(await lawyerStats());
      } else {
        const client = await getClientByUserId(u.id);
        setStats(client ? await clientStats(client.id) : { activeCases: 0, pendingDocs: 0 });
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Olá, {name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "advogado" ? "Resumo do escritório." : "Acompanhe seu caso."}
        </p>
      </div>

      {role === "advogado" && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} label="Clientes ativos" value={stats.clients} />
          <StatCard icon={FolderKanban} label="Processos" value={stats.cases} />
          <StatCard icon={CalendarClock} label="Audiências (7d)" value={stats.hearingsWeek} />
          <StatCard icon={FileText} label="Docs pendentes" value={stats.pendingDocs} />
        </div>
      )}

      {role === "cliente" && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={FolderKanban} label="Processos ativos" value={stats.activeCases} />
          <StatCard icon={FileText} label="Docs pendentes" value={stats.pendingDocs} />
        </div>
      )}
    </div>
  );
}
