"use client"

import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Case, Client } from "@/lib/types"
import { CASE_STATUSES, LEGAL_AREAS } from "@/lib/types"
import { saveCaseAction } from "@/lib/actions"
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
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  )
}

export function CaseFormDialog({ caseItem, clients }: { caseItem?: Case; clients: Client[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(saveCaseAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(caseItem ? "Processo atualizado." : "Processo cadastrado.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, caseItem])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          caseItem ? (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          ) : (
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo processo
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{caseItem ? "Editar processo" : "Novo processo"}</DialogTitle>
          <DialogDescription>Informe os dados do processo judicial.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {caseItem ? <input type="hidden" name="id" value={caseItem.id} /> : null}
          <div className="sm:col-span-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" defaultValue={caseItem?.title} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="number">Número do processo *</Label>
            <Input id="number" name="number" defaultValue={caseItem?.number} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="action_type">Tipo de ação</Label>
            <Input id="action_type" name="action_type" defaultValue={caseItem?.action_type ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="legal_area">Área do direito</Label>
            <Select name="legal_area" defaultValue={caseItem?.legal_area ?? undefined}>
              <SelectTrigger id="legal_area" className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={caseItem?.status ?? "Em Análise"}>
              <SelectTrigger id="status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="court">Tribunal / Vara</Label>
            <Input id="court" name="court" defaultValue={caseItem?.court ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="court_division">Vara / Câmara</Label>
            <Input id="court_division" name="court_division" defaultValue={caseItem?.court_division ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="district">Comarca</Label>
            <Input id="district" name="district" defaultValue={caseItem?.district ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="plaintiff">Autor / Requerente</Label>
            <Input id="plaintiff" name="plaintiff" defaultValue={caseItem?.plaintiff ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="defendant">Réu / Requerido</Label>
            <Input id="defendant" name="defendant" defaultValue={caseItem?.defendant ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lawyer_name">Advogado responsável</Label>
            <Input id="lawyer_name" name="lawyer_name" defaultValue={caseItem?.lawyer_name ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <Select name="client_id" defaultValue={caseItem?.client_id ? String(caseItem.client_id) : undefined}>
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
          <div className="sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={caseItem?.description ?? ""} rows={3} className="mt-1.5" />
          </div>
          <DialogFooter className="sm:col-span-2">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
