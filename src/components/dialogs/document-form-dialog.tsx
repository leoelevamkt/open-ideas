import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveDocument, listClients, listCases } from "@/lib/queries";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { DocumentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none__";

export function DocumentFormDialog({ document, defaults, trigger }: {
  document?: DocumentItem;
  defaults?: { client_id?: string | null; case_id?: string | null };
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ category: "Outros", status: "disponivel" });
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "ativo"], queryFn: () => listClients("ativo"), enabled: open });
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => listCases(), enabled: open });

  useEffect(() => {
    if (!open) return;
    if (document) setForm({ ...document });
    else setForm({ category: "Outros", status: "disponivel", ...defaults });
  }, [open, document, defaults]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = {
      id: document?.id,
      name: String(fd.get("name") ?? ""),
      size_label: (fd.get("size_label") as string) || null,
      category: form.category ?? "Outros",
      status: form.status ?? "disponivel",
      client_id: form.client_id && form.client_id !== NONE ? form.client_id : null,
      case_id: form.case_id && form.case_id !== NONE ? form.case_id : null,
    };
    if (!p.id) delete p.id;
    try {
      await saveDocument(p);
      toast.success(document ? "Documento atualizado." : "Documento adicionado.");
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["docs"] });
      setOpen(false);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (document
          ? <Button variant="ghost" size="icon" className="size-8"><Pencil className="size-4" /></Button>
          : <Button><Plus className="mr-1 h-4 w-4" /> Adicionar documento</Button>)}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Editar documento" : "Adicionar documento"}</DialogTitle>
          <DialogDescription>{document ? "Atualize as informações do documento." : "Registre um novo documento no acervo."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div><Label>Nome do arquivo *</Label><Input name="name" defaultValue={document?.name ?? ""} placeholder="ex: Contrato.pdf" required className="mt-1.5" /></div>
          <div><Label>Tamanho (opcional)</Label><Input name="size_label" defaultValue={document?.size_label ?? ""} placeholder="ex: 1,2 MB" className="mt-1.5" /></div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f: any) => ({ ...f, category: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{DOCUMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f: any) => ({ ...f, status: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Select value={form.client_id ?? NONE} onValueChange={(v) => setForm((f: any) => ({ ...f, client_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem vínculo</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Processo (opcional)</Label>
            <Select value={form.case_id ?? NONE} onValueChange={(v) => setForm((f: any) => ({ ...f, case_id: v }))}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem vínculo</SelectItem>
                {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando..." : (document ? "Salvar alterações" : "Adicionar documento")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
