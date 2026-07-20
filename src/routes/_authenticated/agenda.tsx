import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { HEARING_TYPES } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/agenda")({
  component: AgendaPage,
});

function AgendaPage() {
  const { role } = useAuth();
  const isAdvogado = role === "advogado";
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["hearings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hearings")
        .select("*, cases(title, number)")
        .order("hearing_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (data ?? []).filter((h: any) => h.hearing_date >= today);
  const past = (data ?? []).filter((h: any) => h.hearing_date < today);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold truncate">Agenda e Audiências</h2>
        {isAdvogado && (
          <button onClick={() => setShowNew(true)} className="shrink-0 inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
            <Plus className="size-4" /> Nova<span className="hidden sm:inline">&nbsp;audiência</span>
          </button>
        )}
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      <section>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="size-4" /> Próximas</h3>
        {!upcoming.length ? <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p> : (
          <ul className="divide-y border rounded-lg bg-card">{upcoming.map(renderItem)}</ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="font-semibold mb-2 mt-6 text-muted-foreground">Anteriores</h3>
          <ul className="divide-y border rounded-lg bg-card opacity-70">{past.map(renderItem)}</ul>
        </section>
      )}

      {showNew && <NewHearingDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}

function renderItem(h: any) {
  return (
    <li key={h.id} className="p-4">
      <div className="flex flex-wrap justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">{h.title}</div>
          <div className="text-xs text-muted-foreground">
            {h.cases?.number ? `${h.cases.number} — ${h.cases.title}` : "Sem processo vinculado"}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{h.hearing_date} {h.hearing_time ?? ""}</span>
            {h.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{h.location}</span>}
            {h.link && <a href={h.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><LinkIcon className="size-3" />Acessar</a>}
          </div>
        </div>
        <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 self-start">{h.type}</span>
      </div>
      {h.notes && <p className="text-xs text-muted-foreground mt-2">{h.notes}</p>}
    </li>
  );
}

function NewHearingDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: cases } = useQuery({
    queryKey: ["cases-simple"],
    queryFn: async () => (await supabase.from("cases").select("id, title, number").order("updated_at", { ascending: false })).data ?? [],
  });
  const [form, setForm] = useState({
    title: "", case_id: "", hearing_date: new Date().toISOString().slice(0, 10), hearing_time: "",
    type: "Presencial" as const, location: "", link: "", notes: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, case_id: form.case_id || null };
      const { error } = await supabase.from("hearings").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hearings"] });
      toast.success("Audiência criada");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-card p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">Nova audiência</h3>
        <F label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <div>
          <label className="text-xs text-muted-foreground">Processo</label>
          <select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">—</option>
            {cases?.map((c: any) => <option key={c.id} value={c.id}>{c.number} - {c.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <F label="Data" type="date" value={form.hearing_date} onChange={(v) => setForm({ ...form, hearing_date: v })} />
          <F label="Hora" type="time" value={form.hearing_time} onChange={(v) => setForm({ ...form, hearing_time: v })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {HEARING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <F label="Local" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <F label="Link (online)" value={form.link} onChange={(v) => setForm({ ...form, link: v })} />
        <div>
          <label className="text-xs text-muted-foreground">Observações</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">Cancelar</button>
          <button onClick={() => create.mutate()} disabled={!form.title || create.isPending} className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50">
            {create.isPending ? "Salvando..." : "Criar"}
          </button>
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
