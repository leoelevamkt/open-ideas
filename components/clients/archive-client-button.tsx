"use client"

import { archiveClientAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function ArchiveClientButton({ id, status }: { id: number; status: "ativo" | "arquivado" }) {
  return (
    <form action={archiveClientAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm">
        {status === "arquivado" ? "Reativar" : "Arquivar"}
      </Button>
    </form>
  )
}
