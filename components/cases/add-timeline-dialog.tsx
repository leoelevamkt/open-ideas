"use client"

import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { addTimelineEventAction } from "@/lib/actions"
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
      {pending ? "Salvando..." : "Adicionar"}
    </Button>
  )
}

export function AddTimelineDialog({ caseId }: { caseId: number }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addTimelineEventAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Movimentação adicionada.")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Nova movimentação
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
          <DialogDescription>Registre um novo evento na linha do tempo do processo.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="case_id" value={caseId} />
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="event_date">Data</Label>
            <Input
              id="event_date"
              name="event_date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="responsible">Responsável</Label>
            <Input id="responsible" name="responsible" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} className="mt-1.5" />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
