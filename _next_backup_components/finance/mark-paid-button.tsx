"use client"

import { useFormStatus } from "react-dom"
import { CheckCircle2 } from "lucide-react"
import { markInvoicePaidAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending} className="w-full">
      <CheckCircle2 className="mr-1.5 size-4" />
      {pending ? "Enviando..." : "Já paguei este boleto"}
    </Button>
  )
}

export function MarkPaidButton({ invoiceId }: { invoiceId: number }) {
  return (
    <form action={markInvoicePaidAction}>
      <input type="hidden" name="id" value={invoiceId} />
      <Submit />
    </form>
  )
}
