import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { CASE_STATUSES, LEGAL_AREAS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/processos")({
  component: ProcessosPage,
});

function ProcessosPage() {
  const { role } = useAuth();
  const isAdvogado = role === "advogado";
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*, clients(full_name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((c: any) => {
      const matchQ = !q || c.title?.toLowerCase().includes(q.toLowerCase()) || c.number?.toLowerCase().includes(q.toLowerCase());
      const matchS = !statusFilter || c.status === statusFilter;
      return matchQ && matchS;
    });
  }, [data, q, statusFilter]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Processos</h2>
        {isAdvogado && (
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm">
            <Plus className="size-4" /> Novo processo
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título ou número..."
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Todos status</option>
          {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !filtered.length ? (
        <p className="text-muted-foreground">Nenhum processo encontrado.</p>
      ) : (
        <ul className="divide-y border rounded-lg bg-card">
          {filtered.map((c: any) => (
            <li key={c.id}>
              <Link to="/processos/$id" params={{ id: c.id }} className="block p-4 hover:bg-muted/50">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.number} • {c.legal_area ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">Cliente: {c.clients?.full_name ?? "—"}</div>
                  </div>
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 self-start">{c.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showNew && <NewCaseDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewCaseDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: clients } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await supabase.from("clients").select("id, full_name").order("full_name")).data ?? [],
  });
  const [form, setForm] = useState({
    number: "", title: "", action_type: "", legal_area: "", court: "", court_division: "", district: "",
    plaintiff: "", defendant: "", status: "Em Análise", lawyer_name: "", description: "", client_id: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload = { ...form, client_id: form.client_id || null };
      const { error } = await supabase.from("cases").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Processo criado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-card p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">Novo processo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <F label="Número" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
          <F label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <F label="Tipo de ação" value={form.action_type} onChange={(v) => setForm({ ...form, action_type: v })} />
          <Sel label="Área" value={form.legal_area} onChange={(v) => setForm({ ...form, legal_area: v })} options={LEGAL_AREAS as any} />
          <F label="Vara" value={form.court} onChange={(v) => setForm({ ...form, court: v })} />
          <F label="Órgão julgador" value={form.court_division} onChange={(v) => setForm({ ...form, court_division: v })} />
          <F label="Comarca" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
          <F label="Advogado responsável" value={form.lawyer_name} onChange={(v) => setForm({ ...form, lawyer_name: v })} />
          <F label="Autor" value={form.plaintiff} onChange={(v) => setForm({ ...form, plaintiff: v })} />
          <F label="Réu" value={form.defendant} onChange={(v) => setForm({ ...form, defendant: v })} />
          <Sel label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={CASE_STATUSES as any} />
          <div>
            <label className="text-xs text-muted-foreground">Cliente</label>
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">—</option>
              {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">Cancelar</button>
          <button onClick={() => create.mutate()} disabled={!form.title || !form.number || create.isPending} className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50">
            {create.isPending ? "Salvando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
