import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listClients } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => listClients() });
  const filtered = data.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Cadastro completo do escritório.</p>
      </div>
      <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="flex flex-col gap-2">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{c.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.email ?? c.phone ?? "—"}</p>
              </div>
              <Badge variant={c.status === "ativo" ? "default" : "secondary"}>{c.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>}
      </div>
    </div>
  );
}
