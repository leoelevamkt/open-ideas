import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Archive, Mail, Phone, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/lib/types";
import { PageHero } from "@/components/page-hero";
import { ClientFormDialog } from "@/components/dialogs/client-form-dialog";
import { ClientPreviewDialog } from "@/components/dialogs/client-preview-dialog";
import { archiveClient, listClients } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/clientes")({ component: ClientesPage });

function ClientesPage() {
  const { isStaff, canEdit } = useAuth();
  const isLawyer = isStaff;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"ativo" | "arquivado">("ativo");
  const [preview, setPreview] = useState<Client | null>(null);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["clients", tab], queryFn: () => listClients(tab) });
  const filtered = data.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()) || (c.cpf ?? "").includes(search));

  async function toggleArchive(id: string) {
    try { await archiveClient(id, tab); toast.success(tab === "ativo" ? "Cliente arquivado." : "Cliente reativado."); qc.invalidateQueries({ queryKey: ["clients"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Gestão de clientes" subtitle="Cadastro, histórico e relacionamento em um só lugar." />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {canEdit && <ClientFormDialog />}
      </div>
      {isLawyer && (
        <div className="flex gap-1.5 rounded-lg bg-muted p-1">
          {(["ativo","arquivado"] as const).map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${tab === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              {k === "ativo" ? "Ativos" : "Arquivados"}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {filtered.map(c => (
          <Card key={c.id} className="cursor-pointer transition hover:border-gold/40" onClick={() => setPreview(c)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {c.full_name.split(" ").slice(0,2).map(s => s[0]).join("").toUpperCase() || <UserIcon className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.full_name}</p>
                    {c.cpf && <p className="truncate text-xs text-muted-foreground">CPF: {c.cpf}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {c.email && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> {c.email}</span>}
                      {c.phone && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" /> {c.phone}</span>}
                    </div>
                  </div>
                </div>
                <Badge variant={c.status === "ativo" ? "default" : "secondary"}>{c.status}</Badge>
              </div>
              {canEdit && (
                <div className="mt-3 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => toggleArchive(c.id)}><Archive className="mr-1 size-3.5" /> {tab === "ativo" ? "Arquivar" : "Reativar"}</Button>
                  <ClientFormDialog client={c} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>}
      </div>
      <ClientPreviewDialog client={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </div>
  );
}
