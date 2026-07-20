import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CASE_STATUSES, LEGAL_AREAS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function RelatoriosPage() {
  const { data: cases } = useQuery({
    queryKey: ["cases-report"],
    queryFn: async () => (await supabase.from("cases").select("status, legal_area")).data ?? [],
  });
  const { data: totals } = useQuery({
    queryKey: ["report-totals"],
    queryFn: async () => {
      const [clients, cases, hearings, docs] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("cases").select("id", { count: "exact", head: true }),
        supabase.from("hearings").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ]);
      return {
        clients: clients.count ?? 0,
        cases: cases.count ?? 0,
        hearings: hearings.count ?? 0,
        documents: docs.count ?? 0,
      };
    },
  });

  const byStatus = CASE_STATUSES.map((s) => ({ name: s, value: (cases ?? []).filter((c: any) => c.status === s).length }));
  const byArea = LEGAL_AREAS.map((a) => ({ name: a, value: (cases ?? []).filter((c: any) => c.legal_area === a).length })).filter((x) => x.value > 0);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Relatórios</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Clientes" value={totals?.clients ?? 0} />
        <StatBox label="Processos" value={totals?.cases ?? 0} />
        <StatBox label="Audiências" value={totals?.hearings ?? 0} />
        <StatBox label="Documentos" value={totals?.documents ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-3">Processos por status</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byStatus}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-3">Processos por área</h3>
          <div className="h-72">
            {!byArea.length ? <p className="text-sm text-muted-foreground">Sem dados.</p> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byArea} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {byArea.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
    </div>
  );
}
