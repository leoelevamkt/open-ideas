import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Search, Mail, Phone } from "lucide-react";
import type { Client } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  const { role } = useAuth();
  const isAdvogado = role === "advogado";
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("full_name");
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((c) =>
      !q || c.full_name.toLowerCase().includes(q.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (c.cpf ?? "").includes(q)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold truncate">Clientes</h2>
        {isAdvogado && (
          <button onClick={() => setShowNew(true)} className="shrink-0 inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
            <Plus className="size-4" /> Novo<span className="hidden sm:inline">&nbsp;cliente</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..." className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm" />
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> :
        !filtered.length ? <p className="text-muted-foreground">Nenhum cliente encontrado.</p> : (
        <ul className="divide-y border rounded-lg bg-card">
          {filtered.map((c) => (
            <li key={c.id} className="p-4 flex flex-wrap justify-between gap-2 hover:bg-muted/30">
              <button onClick={() => isAdvogado && setEditing(c)} className="text-left min-w-0 flex-1">
                <div className="font-medium truncate">{c.full_name}</div>
                <div className="text-xs text-muted-foreground flex gap-3 flex-wrap mt-0.5">
                  {c.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" />{c.email}</span>}
                  {c.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{c.phone}</span>}
                  {c.cpf && <span>CPF: {c.cpf}</span>}
                </div>
              </button>
              <span className={`text-xs rounded-full px-2 py-0.5 self-center ${c.status === "ativo" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
            </li>
          ))}
        </ul>
      )}

      {showNew && <ClientDialog onClose={() => setShowNew(false)} />}
      {editing && <ClientDialog client={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ClientDialog({ client, onClose }: { client?: Client; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: client?.full_name ?? "",
    cpf: client?.cpf ?? "",
    rg: client?.rg ?? "",
    birth_date: client?.birth_date ?? "",
    phone: client?.phone ?? "",
    whatsapp: client?.whatsapp ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    notes: client?.notes ?? "",
    status: client?.status ?? "ativo",
  });

  const save = useMutation({
    mutationFn: async () => {
      if (client) {
        const { error } = await supabase.from("clients").update(form).eq("id", client.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success(client ? "Cliente atualizado" : "Cliente criado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!client) return;
      const { error } = await supabase.from("clients").delete().eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente removido");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-card p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">{client ? "Editar cliente" : "Novo cliente"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <F label="Nome completo" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <F label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} />
          <F label="RG" value={form.rg} onChange={(v) => setForm({ ...form, rg: v })} />
          <F label="Nascimento" type="date" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} />
          <F label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <F label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
          <F label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Endereço</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Anotações</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-between gap-2 pt-2">
          {client ? (
            <button onClick={() => confirm("Remover cliente?") && remove.mutate()} className="rounded-md border border-destructive text-destructive px-3 py-1.5 text-sm">Remover</button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">Cancelar</button>
            <button onClick={() => save.mutate()} disabled={!form.full_name || save.isPending} className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50">
              {save.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function F({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
