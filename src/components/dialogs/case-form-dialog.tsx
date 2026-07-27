import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { Case } from "@/lib/types";
import { saveCase, listClients } from "@/lib/queries";
import { CASE_STATUSES, LEGAL_AREAS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientFormDialog } from "@/components/dialogs/client-form-dialog";
import { HearingFormDialog } from "@/components/dialogs/hearing-form-dialog";

export function CaseFormDialog({ caseItem }: { caseItem?: Case }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [scheduleAfter, setScheduleAfter] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [hearingOpen, setHearingOpen] = useState(false);
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "all"], queryFn: () => listClients(), enabled: open });

  const clientsSorted = useMemo(
    () => [...clients].sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? "", "pt-BR")),
    [clients],
  );

  useEffect(() => { if (open) { setForm(caseItem ?? { status: "Em Análise" }); setScheduleAfter(false); } }, [open, caseItem]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = { id: caseItem?.id };
    ["title","number","action_type","court","court_division","district","plaintiff","defendant","lawyer_name","description"].forEach(k => {
      const v = fd.get(k); p[k] = v ? String(v) : null;
    });
    p.legal_area = form.legal_area ?? null;
    p.status = form.status ?? "Em Análise";
    p.client_id = form.client_id ?? null;
    if (!p.id) delete p.id;
    try {
      const saved = await saveCase(p);
      toast.success(caseItem ? "Processo atualizado." : "Processo cadastrado.");
      qc.invalidateQueries({ queryKey: ["cases"] });
      setOpen(false);
      if (!caseItem && scheduleAfter && saved?.id) {
        setCreatedCaseId(saved.id);
        // Aguarda o dialog atual fechar antes de abrir o próximo
        setTimeout(() => setHearingOpen(true), 200);
      }
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {caseItem ? <Button variant="outline" size="sm">Editar</Button> : <Button><Plus className="mr-1 h-4 w-4" /> Novo processo</Button>}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{caseItem ? "Editar processo" : "Novo processo"}</DialogTitle>
            <DialogDescription>Informe os dados do processo judicial.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Título *</Label><Input name="title" defaultValue={caseItem?.title ?? ""} required className="mt-1.5" /></div>
            <div><Label>Número do processo *</Label><Input name="number" defaultValue={caseItem?.number ?? ""} required className="mt-1.5" /></div>
            <div><Label>Tipo de ação</Label><Input name="action_type" defaultValue={caseItem?.action_type ?? ""} className="mt-1.5" /></div>
            <div>
              <Label>Área do direito</Label>
              <Select value={form.legal_area ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, legal_area: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{LEGAL_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "Em Análise"} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{CASE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Tribunal</Label><Input name="court" defaultValue={caseItem?.court ?? ""} className="mt-1.5" /></div>
            <div><Label>Vara / Câmara</Label><Input name="court_division" defaultValue={caseItem?.court_division ?? ""} className="mt-1.5" /></div>
            <div><Label>Comarca</Label><Input name="district" defaultValue={caseItem?.district ?? ""} className="mt-1.5" /></div>
            <div><Label>Autor</Label><Input name="plaintiff" defaultValue={caseItem?.plaintiff ?? ""} className="mt-1.5" /></div>
            <div><Label>Réu</Label><Input name="defendant" defaultValue={caseItem?.defendant ?? ""} className="mt-1.5" /></div>
            <div><Label>Advogado responsável</Label><Input name="lawyer_name" defaultValue={caseItem?.lawyer_name ?? ""} className="mt-1.5" /></div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Cliente</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-gold-strong" onClick={() => setNewClientOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Cadastrar cliente
                </Button>
              </div>
              <Select value={form.client_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, client_id: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{clientsSorted.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Descrição</Label><Textarea name="description" defaultValue={caseItem?.description ?? ""} rows={3} className="mt-1.5" /></div>

            {!caseItem && (
              <label className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-3 sm:col-span-2">
                <Checkbox checked={scheduleAfter} onCheckedChange={(v) => setScheduleAfter(v === true)} />
                <span className="text-sm">Após salvar, agendar audiência / compromisso deste processo</span>
              </label>
            )}

            <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ClientFormDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onCreated={(c) => setForm((f: any) => ({ ...f, client_id: c.id }))}
      />

      {createdCaseId && (
        <HearingFormDialog
          hearing={undefined}
          open={hearingOpen}
          onOpenChange={(v) => { setHearingOpen(v); if (!v) setCreatedCaseId(null); }}
          defaultCaseId={createdCaseId}
          defaultClientId={form.client_id ?? undefined}
        />
      )}
    </>
  );
}
