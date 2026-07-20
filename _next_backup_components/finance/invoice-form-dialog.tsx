"use client"

import { useState, useActionState, useEffect, startTransition } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus, Pencil } from "lucide-react"
import type { Case, Client, Invoice } from "@/lib/types"
import { saveInvoiceAction } from "@/lib/actions"
import { toDateInputValue } from "@/lib/format"
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

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Emitir boleto"}
    </Button>
  )
}

export function InvoiceFormDialog({
  clients,
  cases,
  invoice,
}: {
  clients: Client[]
  cases: Case[]
  invoice?: Invoice
}) {
  const editing = Boolean(invoice)
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => saveInvoiceAction(_prev, formData),
    null,
  )

  useEffect(() => {
    if (state?.success) {
      toast.success(editing ? "Boleto atualizado." : "Boleto emitido e cliente avisado.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, editing])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="ghost" size="icon" className="size-8" aria-label="Editar boleto">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="mr-1 size-4" /> Emitir boleto
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar boleto" : "Emitir novo boleto"}</DialogTitle>
          <DialogDescription>
            {editing ? "Atualize as informações do boleto." : "O cliente será notificado automaticamente."}
          </DialogDescription>
        </DialogHeader>
        <form
          action={(fd) => startTransition(() => formAction(fd))}
          className="flex flex-col gap-4"
        >
          {invoice ? <input type="hidden" name="id" value={invoice.id} /> : null}
          <div>
            <Label htmlFor="client_id">Cliente *</Label>
            <Select name="client_id" defaultValue={invoice ? String(invoice.client_id) : undefined}>
              <SelectTrigger id="client_id" className="mt-1.5">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              name="description"
              defaultValue={invoice?.description ?? ""}
              placeholder="ex: Honorários - Parcela 1/3"
              required
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice ? String(invoice.amount) : ""}
                placeholder="0,00"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Vencimento *</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={invoice ? toDateInputValue(invoice.due_date) : ""}
                required
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="case_id">Processo vinculado (opcional)</Label>
            <Select name="case_id" defaultValue={invoice?.case_id ? String(invoice.case_id) : undefined}>
              <SelectTrigger id="case_id" className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="barcode">Linha digitável / código de barras</Label>
            <Input id="barcode" name="barcode" defaultValue={invoice?.barcode ?? ""} className="mt-1.5" placeholder="00000.00000 00000.000000 ..." />
          </div>
          <div>
            <Label htmlFor="payment_link">Link do boleto (PDF)</Label>
            <Input id="payment_link" name="payment_link" type="url" defaultValue={invoice?.payment_link ?? ""} className="mt-1.5" placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="pix_copy_paste">PIX copia e cola (opcional)</Label>
            <Textarea id="pix_copy_paste" name="pix_copy_paste" defaultValue={invoice?.pix_copy_paste ?? ""} className="mt-1.5" rows={2} />
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={invoice?.notes ?? ""} className="mt-1.5" rows={2} />
          </div>
          <DialogFooter>
            <SubmitButton editing={editing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
