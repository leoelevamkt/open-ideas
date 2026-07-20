import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCase, listTimeline, listDocuments } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/processos/$id")({
  component: ProcessoDetailPage,
});

function ProcessoDetailPage() {
  const { id } = useParams({ from: "/_authenticated/processos/$id" });
  const { data: c } = useQuery({ queryKey: ["case", id], queryFn: () => getCase(id) });
  const { data: timeline = [] } = useQuery({ queryKey: ["timeline", id], queryFn: () => listTimeline(id) });
  const { data: docs = [] } = useQuery({ queryKey: ["docs", id], queryFn: () => listDocuments({ caseId: id }) });

  if (!c) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="flex flex-col gap-5">
      <Link to={"/processos" as any} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-semibold">{c.title}</h1>
        <p className="text-sm text-muted-foreground">Nº {c.number} · <Badge variant="outline">{c.status}</Badge></p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm">
          <p><span className="text-muted-foreground">Área:</span> {c.legal_area ?? "—"}</p>
          <p><span className="text-muted-foreground">Vara:</span> {c.court_division ?? "—"}</p>
          <p><span className="text-muted-foreground">Comarca:</span> {c.district ?? "—"}</p>
          <p><span className="text-muted-foreground">Autor:</span> {c.plaintiff ?? "—"}</p>
          <p><span className="text-muted-foreground">Réu:</span> {c.defendant ?? "—"}</p>
          {c.description && <p className="text-muted-foreground">{c.description}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Linha do tempo</CardTitle></CardHeader>
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
        <CardHeader><CardTitle className="text-base">Documentos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {docs.length === 0 && <p className="text-sm text-muted-foreground">Sem documentos.</p>}
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border border-border/60 p-3 text-sm">
              <span className="truncate">{d.name}</span>
              <Badge variant={d.status === "disponivel" ? "default" : "secondary"}>{d.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
