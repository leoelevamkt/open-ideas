import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FileText, Search, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { DocumentFormDialog } from "@/components/dialogs/document-form-dialog";
import { DocumentPreviewDialog } from "@/components/dialogs/document-preview-dialog";
import { listDocuments, deleteDocument, getClientByUserId } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/documentos")({ component: DocumentosPage });

function DocumentosPage() {
  const { user } = useAuth();
  const isLawyer = user?.role === "advogado";
  const [clientId, setClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<{ path: string; name: string } | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data = [] } = useQuery({
    enabled: !!user,
    queryKey: ["documents", isLawyer, clientId],
    queryFn: () => listDocuments(isLawyer ? undefined : { clientId: clientId ?? undefined }),
  });

  const filtered = data.filter((d: any) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.client_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function onDelete(id: string) {
    if (!confirm("Excluir este documento?")) return;
    try { await deleteDocument(id); toast.success("Documento removido."); qc.invalidateQueries({ queryKey: ["documents"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  function onOpen(d: any) {
    if (!d.file_path) { toast.error("Este documento não possui arquivo anexado."); return; }
    setPreview({ path: d.file_path, name: d.name });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Central de documentos" subtitle="Contratos, petições e comprovantes protegidos." />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar documento…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <DocumentFormDialog defaults={!isLawyer && clientId ? { client_id: clientId } : undefined} />
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((d: any) => (
          <Card key={d.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => onOpen(d.file_path)}
                disabled={!d.file_path}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-strong transition hover:bg-gold/25 disabled:opacity-60"
                aria-label="Abrir documento"
              >
                <FileText className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d.category}{d.client_name ? ` · ${d.client_name}` : ""}{d.size_label ? ` · ${d.size_label}` : ""} · {formatDate(d.created_at)}
                </p>
              </div>
              <Badge variant={d.status === "disponivel" ? "default" : "secondary"}>{d.status}</Badge>
              {d.file_path && (
                <Button variant="ghost" size="icon" onClick={() => onOpen(d.file_path)} className="size-8" aria-label="Abrir">
                  <ExternalLink className="size-4" />
                </Button>
              )}
              {isLawyer && (
                <div className="flex items-center gap-1">
                  <DocumentFormDialog document={d} />
                  <Button variant="ghost" size="icon" onClick={() => onDelete(d.id)} className="size-8 text-destructive"><Trash2 className="size-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum documento.</p>}
      </div>
    </div>
  );
}
