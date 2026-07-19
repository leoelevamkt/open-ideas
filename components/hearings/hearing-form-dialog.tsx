"use client"

import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { Case, Hearing } from "@/lib/types"
import { HEARING_TYPES } from "@/lib/types"
import { saveHearingAction } from "@/lib/actions"
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

export function HearingFormDialog({ hearing, cases }: { hearing?: Hearing; cases: Case[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(saveHearingAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(hearing ? "Audiência atualizada." : "Audiência agendada.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, hearing])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          hearing ? (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          ) : (
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Nova audiência
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hearing ? "Editar audiência" : "Nova audiência"}</DialogTitle>
          <DialogDescription>Agende uma audiência ou compromisso.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {hearing ? <input type="hidden" name="id" value={hearing.id} /> : null}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" defaultValue={hearing?.title} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="case_id">Processo</Label>
            <Select name="case_id" defaultValue={hearing?.case_id ? String(hearing.case_id) : undefined}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hearing_date">Data *</Label>
              <Input id="hearing_date" name="hearing_date" type="date" defaultValue={hearing?.hearing_date} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="hearing_time">Horário</Label>
              <Input id="hearing_time" name="hearing_time" type="time" defaultValue={hearing?.hearing_time ?? ""} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="type">Modalidade</Label>
            <Select name="type" defaultValue={hearing?.type ?? "Presencial"}>
              <SelectTrigger id="type" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEARING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Local</Label>
            <Input id="location" name="location" defaultValue={hearing?.location ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="link">Link (online)</Label>
            <Input id="link" name="link" defaultValue={hearing?.link ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" defaultValue={hearing?.notes ?? ""} rows={2} className="mt-1.5" />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
