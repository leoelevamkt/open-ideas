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
import { maskCpfCnpj, maskRG, maskPhone } from "@/lib/masks";

type Trigger = "default" | "inline";

export function ClientFormDialog({
  client,
  trigger = "default",
  open: controlledOpen,
  onOpenChange,
  onCreated,
}: {
  client?: Client;
  trigger?: Trigger;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  onCreated?: (client: Client) => void;
}) {
  const [uOpen, setUOpen] = useState(false);
  const open = controlledOpen ?? uOpen;
  const setOpen = onOpenChange ?? setUOpen;
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const [cpf, setCpf] = useState(client?.cpf ?? "");
  const [rg, setRg] = useState(client?.rg ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: any = { id: client?.id };
    ["full_name","birth_date","email","address","notes"].forEach(k => {
      const v = fd.get(k); if (v !== null) payload[k] = String(v) || null;
    });
    payload.cpf = cpf || null;
    payload.rg = rg || null;
    payload.phone = phone || null;
    payload.whatsapp = whatsapp || null;
    if (!payload.id) delete payload.id;
    try {
      const saved = await saveClient(payload);
      toast.success(client ? "Cliente atualizado." : "Cliente cadastrado.");
      qc.invalidateQueries({ queryKey: ["clients"] });
      onCreated?.(saved as Client);
      setOpen(false);
    } catch (err: any) { toast.error(err.message ?? "Erro ao salvar"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {client
            ? <Button variant="outline" size="sm">Editar</Button>
            : trigger === "inline"
              ? <Button type="button" variant="outline" size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Novo cliente</Button>
              : <Button><Plus className="mr-1 h-4 w-4" /> Novo cliente</Button>}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>Preencha os dados cadastrais do cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nome completo *</Label><Input name="full_name" defaultValue={client?.full_name ?? ""} required className="mt-1.5" /></div>
          <div><Label>CPF / CNPJ</Label>
            <Input value={cpf} onChange={(e) => setCpf(maskCpfCnpj(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" className="mt-1.5" />
          </div>
          <div><Label>RG</Label>
            <Input value={rg} onChange={(e) => setRg(maskRG(e.target.value))} inputMode="numeric" placeholder="00.000.000-0" className="mt-1.5" />
          </div>
          <div><Label>Data de nascimento</Label><Input type="date" name="birth_date" defaultValue={client?.birth_date ?? ""} className="mt-1.5" /></div>
          <div><Label>E-mail</Label><Input type="email" name="email" defaultValue={client?.email ?? ""} className="mt-1.5" /></div>
          <div><Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} inputMode="tel" placeholder="(00) 00000-0000" className="mt-1.5" />
          </div>
          <div><Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(maskPhone(e.target.value))} inputMode="tel" placeholder="(00) 00000-0000" className="mt-1.5" />
          </div>
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
