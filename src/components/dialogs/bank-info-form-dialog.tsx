import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { upsertBankInfo } from "@/lib/queries";
import { PIX_KEY_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BankInfoFormDialog({ bank }: { bank: any }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const qc = useQueryClient();
  useEffect(() => { if (open) setForm(bank ?? {}); }, [open, bank]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = {};
    ["bank_name","agency","account","account_type","holder","document","pix_key","notes"].forEach(k => { const v = fd.get(k); p[k] = v ? String(v) : null; });
    p.pix_type = form.pix_type ?? null;
    try { await upsertBankInfo(p); toast.success("Dados bancários salvos."); qc.invalidateQueries({ queryKey: ["bank"] }); setOpen(false); }
    catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm"><Pencil className="mr-1.5 size-3.5" />Editar dados bancários</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Dados bancários do escritório</DialogTitle><DialogDescription>Essas informações ficam visíveis aos clientes.</DialogDescription></DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div><Label>Banco</Label><Input name="bank_name" defaultValue={bank?.bank_name ?? ""} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Agência</Label><Input name="agency" defaultValue={bank?.agency ?? ""} className="mt-1.5" /></div>
            <div><Label>Conta</Label><Input name="account" defaultValue={bank?.account ?? ""} className="mt-1.5" /></div>
          </div>
          <div><Label>Tipo de conta</Label><Input name="account_type" defaultValue={bank?.account_type ?? ""} placeholder="Corrente / Poupança" className="mt-1.5" /></div>
          <div><Label>Titular</Label><Input name="holder" defaultValue={bank?.holder ?? ""} className="mt-1.5" /></div>
          <div><Label>CPF / CNPJ</Label><Input name="document" defaultValue={bank?.document ?? ""} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Chave PIX</Label><Input name="pix_key" defaultValue={bank?.pix_key ?? ""} className="mt-1.5" /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.pix_type ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, pix_type: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{PIX_KEY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Observações</Label><Textarea name="notes" defaultValue={bank?.notes ?? ""} rows={2} className="mt-1.5" /></div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
