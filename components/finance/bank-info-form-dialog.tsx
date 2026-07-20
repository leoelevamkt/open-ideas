"use client"

import { useState, useActionState, useEffect, startTransition } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import type { BankInfo } from "@/lib/types"
import { PIX_KEY_TYPES } from "@/lib/types"
import { saveBankInfoAction } from "@/lib/actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar dados"}
    </Button>
  )
}

export function BankInfoFormDialog({ bank }: { bank: BankInfo | null }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => saveBankInfoAction(_prev, formData),
    null,
  )

  useEffect(() => {
    if (state?.success) {
      toast.success("Dados bancários atualizados.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-4" /> Editar dados bancários
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dados bancários do escritório</DialogTitle>
          <DialogDescription>Estas informações ficam visíveis para os clientes.</DialogDescription>
        </DialogHeader>
        <form
          action={(fd) => startTransition(() => formAction(fd))}
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="bank_name">Banco</Label>
            <Input id="bank_name" name="bank_name" defaultValue={bank?.bank_name ?? ""} className="mt-1.5" placeholder="ex: Banco do Brasil" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="agency">Agência</Label>
              <Input id="agency" name="agency" defaultValue={bank?.agency ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="account">Conta</Label>
              <Input id="account" name="account" defaultValue={bank?.account ?? ""} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="account_type">Tipo de conta</Label>
            <Input id="account_type" name="account_type" defaultValue={bank?.account_type ?? ""} className="mt-1.5" placeholder="ex: Conta Corrente" />
          </div>
          <div>
            <Label htmlFor="holder">Titular</Label>
            <Input id="holder" name="holder" defaultValue={bank?.holder ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="document">CNPJ / CPF do titular</Label>
            <Input id="document" name="document" defaultValue={bank?.document ?? ""} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input id="pix_key" name="pix_key" defaultValue={bank?.pix_key ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="pix_type">Tipo da chave</Label>
              <Select name="pix_type" defaultValue={bank?.pix_type ?? "E-mail"}>
                <SelectTrigger id="pix_type" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIX_KEY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={bank?.notes ?? ""} className="mt-1.5" rows={2} placeholder="ex: Envie o comprovante após o pagamento." />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
