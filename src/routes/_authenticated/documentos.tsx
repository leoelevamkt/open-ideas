import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listDocuments } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/documentos")({
  component: DocumentosPage,
});

function DocumentosPage() {
  const { data = [] } = useQuery({ queryKey: ["documents"], queryFn: () => listDocuments() });
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Documentos</h1>
        <p className="text-sm text-muted-foreground">Central de documentos do escritório.</p>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d: any) => (
          <Card key={d.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d.category}{d.client_name ? ` · ${d.client_name}` : ""}
                </p>
              </div>
              <Badge variant={d.status === "disponivel" ? "default" : "secondary"}>{d.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento.</p>}
      </div>
    </div>
  );
}
