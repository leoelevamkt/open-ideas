import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveInvoice, listClients, listCases } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InvoiceFormDialog({ invoice }: { invoice?: any }) {
  const editing = !!invoice;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "ativo"], queryFn: () => listClients("ativo"), enabled: open });
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => listCases(), enabled: open });

  useEffect(() => { if (open) setForm(invoice ?? { status: "pendente" }); }, [open, invoice]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = { id: invoice?.id };
    p.description = fd.get("description");
    p.amount = Number(fd.get("amount") ?? 0);
    p.due_date = fd.get("due_date");
    p.barcode = fd.get("barcode") || null;
    p.payment_link = fd.get("payment_link") || null;
    p.pix_copy_paste = fd.get("pix_copy_paste") || null;
    p.notes = fd.get("notes") || null;
    p.client_id = form.client_id ?? null;
    p.case_id = form.case_id ?? null;
    if (!p.id) delete p.id;
    try { await saveInvoice(p); toast.success(editing ? "Boleto atualizado." : "Boleto emitido."); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["finance-stats"] }); setOpen(false); }
    catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? <Button variant="ghost" size="icon" className="size-8"><Pencil className="size-4" /></Button> : <Button><Plus className="mr-1 size-4" /> Emitir boleto</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar boleto" : "Emitir novo boleto"}</DialogTitle><DialogDescription>{editing ? "Atualize as informações do boleto." : "O cliente será notificado automaticamente."}</DialogDescription></DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Cliente *</Label>
            <Select value={form.client_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, client_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Descrição *</Label><Input name="description" defaultValue={invoice?.description ?? ""} placeholder="ex: Honorários - Parcela 1/3" required className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" min="0" name="amount" defaultValue={invoice?.amount ?? ""} required className="mt-1.5" /></div>
            <div><Label>Vencimento *</Label><Input type="date" name="due_date" defaultValue={invoice?.due_date ?? ""} required className="mt-1.5" /></div>
          </div>
          <div>
            <Label>Processo vinculado (opcional)</Label>
            <Select value={form.case_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, case_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Linha digitável / código de barras</Label><Input name="barcode" defaultValue={invoice?.barcode ?? ""} className="mt-1.5" /></div>
          <div><Label>Link do boleto (PDF)</Label><Input type="url" name="payment_link" defaultValue={invoice?.payment_link ?? ""} className="mt-1.5" /></div>
          <div><Label>PIX copia e cola</Label><Textarea name="pix_copy_paste" defaultValue={invoice?.pix_copy_paste ?? ""} rows={2} className="mt-1.5" /></div>
          <div><Label>Observações</Label><Textarea name="notes" defaultValue={invoice?.notes ?? ""} rows={2} className="mt-1.5" /></div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Emitir boleto"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
