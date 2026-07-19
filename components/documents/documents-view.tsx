"use client"

import { useState } from "react"
import { FileText, Search, Trash2, Download } from "lucide-react"
import type { DocumentItem, Role } from "@/lib/types"
import { DOCUMENT_CATEGORIES } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { deleteDocumentAction } from "@/lib/actions"
import { formatDate } from "@/lib/format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Doc = DocumentItem & { uploader_name: string | null; client_name: string | null }

export function DocumentsView({ documents, role }: { documents: Doc[]; role: Role }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("todas")

  const filtered = documents.filter((d) => {
    const matchQuery = d.name.toLowerCase().includes(query.toLowerCase())
    const matchCat = category === "todas" || d.category === category
    return matchQuery && matchCat
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar documento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "todas")}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum documento encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[d.category, d.client_name, formatDate(d.created_at)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={d.status} />
                  <Button variant="ghost" size="icon" aria-label="Baixar documento" disabled>
                    <Download className="h-4 w-4" />
                  </Button>
                  {role === "advogado" ? (
                    <form action={deleteDocumentAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="ghost" size="icon" aria-label="Excluir documento">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
