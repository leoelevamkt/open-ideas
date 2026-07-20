"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import type { Case, Client, Role } from "@/lib/types"
import { CASE_STATUSES } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { CaseFormDialog } from "@/components/cases/case-form-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CasesList({
  cases,
  clients,
  role,
}: {
  cases: Array<Case & { client_name?: string | null }>
  clients: Client[]
  role: Role
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("todos")

  const filtered = cases.filter((c) => {
    const matchQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.number.includes(query) ||
      (c.plaintiff ?? "").toLowerCase().includes(query.toLowerCase())
    const matchStatus = status === "todos" || c.status === status
    return matchQuery && matchStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, título ou parte..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "todos")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {CASE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "advogado" ? <CaseFormDialog clients={clients} /> : null}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum processo encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <Link key={c.id} href={`/processos/${c.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.number}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[c.legal_area, c.court, c.district].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {role === "advogado" && c.client_name ? (
                    <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                      <span className="text-xs uppercase tracking-wide">Cliente</span>
                      <p className="font-medium text-foreground">{c.client_name}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
