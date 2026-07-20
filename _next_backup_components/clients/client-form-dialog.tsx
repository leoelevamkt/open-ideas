"use client"

import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Client } from "@/lib/types"
import { saveClientAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  )
}

export function ClientFormDialog({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(saveClientAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(client ? "Cliente atualizado." : "Cliente cadastrado.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, client])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          client ? (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          ) : (
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo cliente
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>Preencha os dados cadastrais do cliente.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {client ? <input type="hidden" name="id" value={client.id} /> : null}
          <div className="sm:col-span-2">
            <Label htmlFor="full_name">Nome completo *</Label>
            <Input id="full_name" name="full_name" defaultValue={client?.full_name} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cpf">CPF / CNPJ</Label>
            <Input id="cpf" name="cpf" defaultValue={client?.cpf ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="rg">RG</Label>
            <Input id="rg" name="rg" defaultValue={client?.rg ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="birth_date">Data de nascimento</Label>
            <Input id="birth_date" name="birth_date" type="date" defaultValue={client?.birth_date ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={client?.whatsapp ?? ""} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={client?.address ?? ""} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} className="mt-1.5" rows={3} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
