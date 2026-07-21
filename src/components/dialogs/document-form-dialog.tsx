import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveDocument, listClients, listCases, uploadDocumentFile } from "@/lib/queries";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { DocumentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "__none__";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentFormDialog({ document, defaults, trigger }: {
  document?: DocumentItem;
  defaults?: { client_id?: string | null; case_id?: string | null };
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ category: "Outros", status: "disponivel" });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { data: clients = [] } = useQuery({ queryKey: ["clients", "all"], queryFn: () => listClients(), enabled: open });
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => listCases(), enabled: open });

  const selectedClient = clients.find((c: any) => c.id === form.client_id);
  const selectedCase = cases.find((c: any) => c.id === form.case_id);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    if (document) setForm({ ...document });
    else setForm({ category: "Outros", status: "disponivel", ...defaults });
  }, [open, document, defaults]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const p: any = {
      id: document?.id,
      name: String(fd.get("name") ?? "") || file?.name || "",
      size_label: (fd.get("size_label") as string) || (file ? humanSize(file.size) : null),
      category: form.category ?? "Outros",
      status: form.status ?? "disponivel",
      client_id: form.client_id && form.client_id !== NONE ? form.client_id : null,
      case_id: form.case_id && form.case_id !== NONE ? form.case_id : null,
    };
    if (!p.id) delete p.id;
    try {
      if (file) {
        const uploaded = await uploadDocumentFile(file);
        Object.assign(p, uploaded);
      }
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
          <div>
            <Label>Arquivo {document ? "(deixe em branco para manter)" : ""}</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1 size-4" /> {file ? "Trocar arquivo" : "Selecionar arquivo"}
              </Button>
              <span className="truncate text-xs text-muted-foreground">
                {file ? `${file.name} · ${humanSize(file.size)}` : (document?.file_path ? "Arquivo já anexado" : "Nenhum arquivo selecionado")}
              </span>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div><Label>Nome do documento *</Label><Input name="name" defaultValue={document?.name ?? ""} placeholder="ex: Contrato.pdf" required className="mt-1.5" /></div>
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
