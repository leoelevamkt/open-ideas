import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { CASE_STATUSES } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/processos/$id")({
  component: ProcessoDetail,
});

function ProcessoDetail() {
  const { id } = Route.useParams();
  const { role } = useAuth();
  const qc = useQueryClient();
  const isAdvogado = role === "advogado";

  const { data: c, isLoading } = useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*, clients(full_name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ["case-timeline", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("timeline_events")
        .select("*")
        .eq("case_id", id)
        .order("event_date", { ascending: false });
      return data ?? [];
    },
  });

  const { data: hearings } = useQuery({
    queryKey: ["case-hearings", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hearings")
        .select("*")
        .eq("case_id", id)
        .order("hearing_date");
      return data ?? [];
    },
  });

  const { data: documents } = useQuery({
    queryKey: ["case-documents", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("cases").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", id] });
      toast.success("Status atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [showEvent, setShowEvent] = useState(false);

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;
  if (!c) return <div>Processo não encontrado.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link to="/processos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h2 className="text-2xl font-semibold">{c.title}</h2>
            <p className="text-sm text-muted-foreground">{c.number}</p>
          </div>
          {isAdvogado ? (
            <select
              value={c.status}
              onChange={(e) => updateStatus.mutate(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs">{c.status}</span>
          )}
        </div>
      </div>

      <section className="rounded-lg border bg-card p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <Field label="Tipo de ação" value={c.action_type} />
        <Field label="Área" value={c.legal_area} />
        <Field label="Vara" value={c.court} />
        <Field label="Órgão julgador" value={c.court_division} />
        <Field label="Comarca" value={c.district} />
        <Field label="Advogado responsável" value={c.lawyer_name} />
        <Field label="Autor" value={c.plaintiff} />
        <Field label="Réu" value={c.defendant} />
        <Field label="Cliente" value={c.clients?.full_name ?? "—"} />
        <Field label="Descrição" value={c.description} full />
      </section>

      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Linha do tempo</h3>
          {isAdvogado && (
            <button
              onClick={() => setShowEvent(true)}
              className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs"
            >
              <Plus className="size-3.5" /> Adicionar evento
            </button>
          )}
        </div>
        {!timeline?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
        ) : (
          <ol className="relative border-l pl-4 space-y-4">
            {timeline.map((e: any) => (
              <li key={e.id}>
                <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-primary" />
                <div className="text-xs text-muted-foreground">{e.event_date}{e.responsible ? ` • ${e.responsible}` : ""}</div>
                <div className="font-medium">{e.title}</div>
                {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h3 className="font-semibold mb-3">Audiências</h3>
        {!hearings?.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma audiência para este processo.</p>
        ) : (
          <ul className="divide-y">
            {hearings.map((h: any) => (
              <li key={h.id} className="py-2 text-sm flex justify-between">
                <div>
                  <div className="font-medium">{h.title}</div>
                  <div className="text-xs text-muted-foreground">{h.type} • {h.location ?? h.link ?? "—"}</div>
                </div>
                <div className="text-xs text-muted-foreground">{h.hearing_date} {h.hearing_time ?? ""}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h3 className="font-semibold mb-3">Documentos</h3>
        {!documents?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum documento vinculado.</p>
        ) : (
          <ul className="divide-y">
            {documents.map((d: any) => (
              <li key={d.id} className="py-2 text-sm flex justify-between">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.category} • {d.size_label ?? ""}</div>
                </div>
                <span className="text-xs rounded-full bg-muted px-2 py-0.5 self-center">{d.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showEvent && <NewEventDialog caseId={id} onClose={() => setShowEvent(false)} />}
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string | null | undefined; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value || "—"}</div>
    </div>
  );
}

function NewEventDialog({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", event_date: new Date().toISOString().slice(0, 10), responsible: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("timeline_events").insert({ case_id: caseId, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast.success("Evento adicionado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-card p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold">Novo evento</h3>
        <Input label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <Input label="Data" type="date" value={form.event_date} onChange={(v) => setForm({ ...form, event_date: v })} />
        <Input label="Responsável" value={form.responsible} onChange={(v) => setForm({ ...form, responsible: v })} />
        <div>
          <label className="text-xs text-muted-foreground">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">Cancelar</button>
          <button
            onClick={() => create.mutate()}
            disabled={!form.title || create.isPending}
            className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {create.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
