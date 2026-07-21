import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { getCase, listTimeline, listDocuments, addTimelineEvent, getDocumentSignedUrl } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CaseFormDialog } from "@/components/dialogs/case-form-dialog";
import { DocumentFormDialog } from "@/components/dialogs/document-form-dialog";

export const Route = createFileRoute("/_authenticated/processos/$id")({
  component: ProcessoDetailPage,
});

function ProcessoDetailPage() {
  const { id } = useParams({ from: "/_authenticated/processos/$id" });
  const { user } = useAuth();
  const isLawyer = user?.role === "advogado";
  const { data: c } = useQuery({ queryKey: ["case", id], queryFn: () => getCase(id) });
  const { data: timeline = [] } = useQuery({ queryKey: ["timeline", id], queryFn: () => listTimeline(id) });
  const { data: docs = [] } = useQuery({ queryKey: ["docs", id], queryFn: () => listDocuments({ caseId: id }) });

  if (!c) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="flex flex-col gap-5">
      <Link to={"/processos" as any} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold">{c.title}</h1>
          <p className="text-sm text-muted-foreground">Nº {c.number} · <Badge variant="outline">{c.status}</Badge></p>
        </div>
        {isLawyer && <CaseFormDialog caseItem={c} />}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Área:</span> {c.legal_area ?? "—"}</p>
          <p><span className="text-muted-foreground">Tipo de ação:</span> {c.action_type ?? "—"}</p>
          <p><span className="text-muted-foreground">Tribunal:</span> {c.court ?? "—"}</p>
          <p><span className="text-muted-foreground">Vara:</span> {c.court_division ?? "—"}</p>
          <p><span className="text-muted-foreground">Comarca:</span> {c.district ?? "—"}</p>
          <p><span className="text-muted-foreground">Advogado:</span> {c.lawyer_name ?? "—"}</p>
          <p><span className="text-muted-foreground">Autor:</span> {c.plaintiff ?? "—"}</p>
          <p><span className="text-muted-foreground">Réu:</span> {c.defendant ?? "—"}</p>
          {c.description && <p className="sm:col-span-2 text-muted-foreground">{c.description}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Linha do tempo</CardTitle>
          {isLawyer && <AddTimelineDialog caseId={id} />}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {timeline.length === 0 && <p className="text-sm text-muted-foreground">Sem movimentações.</p>}
          {timeline.map((t) => (
            <div key={t.id} className="border-l-2 border-accent/60 pl-3">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(t.event_date).toLocaleDateString("pt-BR")}</p>
              {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Documentos</CardTitle>
          {isLawyer && <DocumentFormDialog />}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {docs.length === 0 && <p className="text-sm text-muted-foreground">Sem documentos.</p>}
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-3 text-sm">
              <span className="truncate">{d.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={d.status === "disponivel" ? "default" : "secondary"}>{d.status}</Badge>
                {d.file_path && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const url = await getDocumentSignedUrl(d.file_path!);
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch (e: any) { toast.error(e.message); }
                    }}
                  >
                    Abrir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AddTimelineDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addTimelineEvent({
        case_id: caseId,
        title: String(fd.get("title") || ""),
        description: (fd.get("description") as string) || null,
        responsible: (fd.get("responsible") as string) || null,
        event_date: (fd.get("event_date") as string) || new Date().toISOString().slice(0, 10),
      });
      toast.success("Movimentação registrada.");
      qc.invalidateQueries({ queryKey: ["timeline", caseId] });
      setOpen(false);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-1 size-4" /> Adicionar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
          <DialogDescription>Registre um novo evento na linha do tempo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div><Label>Título *</Label><Input name="title" required className="mt-1.5" /></div>
          <div><Label>Data *</Label><Input type="date" name="event_date" required defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1.5" /></div>
          <div><Label>Responsável</Label><Input name="responsible" className="mt-1.5" /></div>
          <div><Label>Descrição</Label><Textarea name="description" rows={3} className="mt-1.5" /></div>
          <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
