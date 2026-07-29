import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveHearing, listClients, listCases } from "@/lib/queries";
import { HEARING_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function HearingFormDialog({
  hearing,
  open: controlledOpen,
  onOpenChange,
  defaultCaseId,
  defaultClientId,
}: {
  hearing?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  defaultCaseId?: string;
  defaultClientId?: string;
}) {
  const [uOpen, setUOpen] = useState(false);
  const open = controlledOpen ?? uOpen;
  const setOpen = onOpenChange ?? setUOpen;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "all"], queryFn: () => listClients(), enabled: open });
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => listCases(), enabled: open });

  const clientsSorted = useMemo(
    () => [...clients].sort((a: any, b: any) => (a.full_name ?? "").localeCompare(b.full_name ?? "", "pt-BR")),
    [clients],
  );
  // Processos ordenados pelo número do processo (identificação mais precisa).
  const casesSorted = useMemo(
    () => [...cases].sort((a: any, b: any) => (a.number ?? "").localeCompare(b.number ?? "", "pt-BR")),
    [cases],
  );

  useEffect(() => {
    if (open) {
      setForm(hearing ?? {
        type: "Presencial",
        case_id: defaultCaseId ?? null,
        client_id: defaultClientId ?? null,
      });
    }
  }, [open, hearing, defaultCaseId, defaultClientId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = { id: hearing?.id };
    ["title","hearing_date","hearing_time","location","link","notes"].forEach(k => { const v = fd.get(k); p[k] = v ? String(v) : null; });
    p.client_id = form.client_id ?? null;
    p.case_id = form.case_id ?? null;
    p.type = form.type ?? "Presencial";
    if (!p.id) delete p.id;
    try { await saveHearing(p); toast.success(hearing ? "Audiência atualizada." : "Audiência agendada."); qc.invalidateQueries({ queryKey: ["hearings"] }); setOpen(false); }
    catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {hearing ? <Button variant="outline" size="sm">Editar</Button> : <Button><Plus className="mr-1 h-4 w-4" /> Nova audiência</Button>}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{hearing ? "Editar audiência" : "Nova audiência"}</DialogTitle><DialogDescription>Agende uma audiência ou compromisso.</DialogDescription></DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div><Label>Título *</Label><Input name="title" defaultValue={hearing?.title ?? ""} required className="mt-1.5" /></div>
          <div>
            <Label>Cliente *</Label>
            <Select value={form.client_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, client_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>{clientsSorted.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Processo</Label>
            <Select value={form.case_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, case_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
              <SelectContent>{casesSorted.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.number ? `Nº ${c.number}` : "Sem número"} — {c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Data *</Label><Input type="date" name="hearing_date" defaultValue={hearing?.hearing_date ?? ""} required className="mt-1.5" /></div>
            <div><Label>Horário</Label><Input type="time" name="hearing_time" defaultValue={hearing?.hearing_time ?? ""} className="mt-1.5" /></div>
          </div>
          <div>
            <Label>Modalidade</Label>
            <Select value={form.type ?? "Presencial"} onValueChange={(v) => setForm((f: any) => ({ ...f, type: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{HEARING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Local</Label><Input name="location" defaultValue={hearing?.location ?? ""} className="mt-1.5" /></div>
          <div><Label>Link (online)</Label><Input name="link" defaultValue={hearing?.link ?? ""} className="mt-1.5" /></div>
          <div><Label>Observações</Label><Textarea name="notes" defaultValue={hearing?.notes ?? ""} rows={3} className="mt-1.5" /></div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
