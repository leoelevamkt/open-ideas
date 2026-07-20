import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Search, FileText } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/documentos")({
  component: DocumentosPage,
});

function DocumentosPage() {
  const { role } = useAuth();
  const isAdvogado = role === "advogado";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, clients(full_name), cases(number, title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((d: any) =>
      (!q || d.name.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || d.category === cat)
    );
  }, [data, q, cat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Documentos</h2>
        {isAdvogado && (
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm">
            <Plus className="size-4" /> Novo documento
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar documento..." className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Todas categorias</option>
          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> :
        !filtered.length ? <p className="text-muted-foreground">Nenhum documento encontrado.</p> : (
        <ul className="divide-y border rounded-lg bg-card">
          {filtered.map((d: any) => (
            <li key={d.id} className="p-4 flex flex-wrap justify-between gap-2">
              <div className="min-w-0 flex items-start gap-3">
                <FileText className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.category} • {d.size_label ?? "—"}
                    {d.clients?.full_name ? ` • Cliente: ${d.clients.full_name}` : ""}
                    {d.cases?.number ? ` • Processo: ${d.cases.number}` : ""}
                  </div>
                </div>
              </div>
              <span className={`text-xs rounded-full px-2 py-0.5 self-start ${d.status === "disponivel" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                {d.status === "disponivel" ? "Disponível" : "Pendente"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showNew && <NewDocumentDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewDocumentDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: clients } = useQuery({ queryKey: ["clients-simple"], queryFn: async () => (await supabase.from("clients").select("id, full_name").order("full_name")).data ?? [] });
  const { data: cases } = useQuery({ queryKey: ["cases-simple"], queryFn: async () => (await supabase.from("cases").select("id, number, title")).data ?? [] });
  const [form, setForm] = useState({ name: "", category: "Contratos", client_id: "", case_id: "", status: "disponivel" as const, size_label: "" });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, client_id: form.client_id || null, case_id: form.case_id || null, uploaded_by: user?.id };
      const { error } = await supabase.from("documents").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento registrado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-card p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">Novo documento</h3>
        <F label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <div>
          <label className="text-xs text-muted-foreground">Categoria</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <F label="Tamanho (ex: 2 MB)" value={form.size_label} onChange={(v) => setForm({ ...form, size_label: v })} />
        <div>
          <label className="text-xs text-muted-foreground">Cliente</label>
          <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">—</option>
            {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Processo</label>
          <select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">—</option>
            {cases?.map((c: any) => <option key={c.id} value={c.id}>{c.number} - {c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="disponivel">Disponível</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">Cancelar</button>
          <button onClick={() => create.mutate()} disabled={!form.name || create.isPending} className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50">
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
