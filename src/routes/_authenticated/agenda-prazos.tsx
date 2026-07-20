import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listHearings } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/agenda-prazos")({
  component: PrazosPage,
});

function PrazosPage() {
  const { data = [] } = useQuery({ queryKey: ["hearings-all"], queryFn: () => listHearings() });
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.filter((h: any) => h.hearing_date >= today).slice(0, 30);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Agenda de Prazos</h1>
        <p className="text-sm text-muted-foreground">Próximos compromissos e prazos.</p>
      </div>
      <div className="flex flex-col gap-2">
        {upcoming.map((h: any) => (
          <Card key={h.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{h.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.hearing_date).toLocaleDateString("pt-BR")}{h.hearing_time ? ` · ${h.hearing_time}` : ""}
                </p>
              </div>
              <Badge variant="outline">{h.type}</Badge>
            </CardContent>
          </Card>
        ))}
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Sem prazos próximos.</p>}
      </div>
    </div>
  );
}
