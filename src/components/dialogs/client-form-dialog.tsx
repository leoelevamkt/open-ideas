import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/lib/types";
import { saveClient } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ClientFormDialog({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = { id: client?.id };
    ["full_name","cpf","rg","birth_date","email","phone","whatsapp","address","notes"].forEach(k => {
      const v = fd.get(k); if (v !== null) payload[k] = String(v) || null;
    });
    if (!payload.id) delete payload.id;
    try {
      await saveClient(payload);
      toast.success(client ? "Cliente atualizado." : "Cliente cadastrado.");
      qc.invalidateQueries({ queryKey: ["clients"] });
      setOpen(false);
    } catch (err: any) { toast.error(err.message ?? "Erro ao salvar"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? <Button variant="outline" size="sm">Editar</Button> : <Button><Plus className="mr-1 h-4 w-4" /> Novo cliente</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>Preencha os dados cadastrais do cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nome completo *</Label><Input name="full_name" defaultValue={client?.full_name ?? ""} required className="mt-1.5" /></div>
          <div><Label>CPF / CNPJ</Label><Input name="cpf" defaultValue={client?.cpf ?? ""} className="mt-1.5" /></div>
          <div><Label>RG</Label><Input name="rg" defaultValue={client?.rg ?? ""} className="mt-1.5" /></div>
          <div><Label>Data de nascimento</Label><Input type="date" name="birth_date" defaultValue={client?.birth_date ?? ""} className="mt-1.5" /></div>
          <div><Label>E-mail</Label><Input type="email" name="email" defaultValue={client?.email ?? ""} className="mt-1.5" /></div>
          <div><Label>Telefone</Label><Input name="phone" defaultValue={client?.phone ?? ""} className="mt-1.5" /></div>
          <div><Label>WhatsApp</Label><Input name="whatsapp" defaultValue={client?.whatsapp ?? ""} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label>Endereço</Label><Input name="address" defaultValue={client?.address ?? ""} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label>Observações</Label><Textarea name="notes" defaultValue={client?.notes ?? ""} rows={3} className="mt-1.5" /></div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
