"use client"

import { useState, useActionState, useEffect, startTransition } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Case, Client } from "@/lib/types"
import { DOCUMENT_CATEGORIES } from "@/lib/types"
import { saveDocumentAction } from "@/lib/actions"
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
      {pending ? "Salvando..." : "Adicionar documento"}
    </Button>
  )
}

export function DocumentFormDialog({ clients, cases }: { clients: Client[]; cases: Case[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => saveDocumentAction(_prev, formData),
    null,
  )

  useEffect(() => {
    if (state?.success) {
      toast.success("Documento adicionado.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Adicionar documento
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
          <DialogDescription>Registre um novo documento no acervo.</DialogDescription>
        </DialogHeader>
        <form
          action={(fd) => startTransition(() => formAction(fd))}
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="name">Nome do arquivo *</Label>
            <Input id="name" name="name" placeholder="ex: Contrato.pdf" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue="Outros">
              <SelectTrigger id="category" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select name="client_id">
              <SelectTrigger id="client_id" className="mt-1.5">
                <SelectValue placeholder="Selecione" />
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
            <Label htmlFor="case_id">Processo (opcional)</Label>
            <Select name="case_id">
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
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
