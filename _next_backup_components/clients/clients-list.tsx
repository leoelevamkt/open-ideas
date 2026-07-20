"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Phone, Mail } from "lucide-react"
import type { Client } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { ArchiveClientButton } from "@/components/clients/archive-client-button"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export function ClientsList({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("")
  const filtered = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(query.toLowerCase()) ||
      (c.cpf ?? "").includes(query) ||
      (c.email ?? "").toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ClientFormDialog />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">{initials(c.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link href={`/clientes/${c.id}`} className="font-medium text-foreground hover:underline">
                        {c.full_name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{c.cpf}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {c.phone ? (
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </span>
                  ) : null}
                  {c.email ? (
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> <span className="truncate">{c.email}</span>
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <ClientFormDialog client={c} />
                  <ArchiveClientButton id={c.id} status={c.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
