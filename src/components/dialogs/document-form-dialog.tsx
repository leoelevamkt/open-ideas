import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveDocument, listClients, listCases } from "@/lib/queries";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DocumentFormDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ category: "Outros" });
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "ativo"], queryFn: () => listClients("ativo"), enabled: open });
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => listCases(), enabled: open });

  useEffect(() => { if (open) setForm({ category: "Outros" }); }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = {
      name: String(fd.get("name") ?? ""),
      category: form.category ?? "Outros",
      client_id: form.client_id ?? null,
      case_id: form.case_id ?? null,
    };
    try { await saveDocument(p); toast.success("Documento adicionado."); qc.invalidateQueries({ queryKey: ["documents"] }); setOpen(false); }
    catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Adicionar documento</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar documento</DialogTitle><DialogDescription>Registre um novo documento no acervo.</DialogDescription></DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div><Label>Nome do arquivo *</Label><Input name="name" placeholder="ex: Contrato.pdf" required className="mt-1.5" /></div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f: any) => ({ ...f, category: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{DOCUMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Select value={form.client_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, client_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Processo (opcional)</Label>
            <Select value={form.case_id ?? ""} onValueChange={(v) => setForm((f: any) => ({ ...f, case_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar documento"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
