import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listHearings } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/agenda")({
  component: AgendaPage,
});

function AgendaPage() {
  const { data = [] } = useQuery({ queryKey: ["hearings"], queryFn: () => listHearings() });
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Agenda e Audiências</h1>
        <p className="text-sm text-muted-foreground">Compromissos organizados por data.</p>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((h: any) => (
          <Card key={h.id}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <CalendarClock className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{h.title}</p>
                  <Badge variant="outline">{h.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.hearing_date).toLocaleDateString("pt-BR")}
                  {h.hearing_time ? ` · ${h.hearing_time}` : ""}
                </p>
                {h.case_title && <p className="truncate text-xs text-muted-foreground">Processo: {h.case_title}</p>}
                {h.location && <p className="truncate text-xs text-muted-foreground">{h.location}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p>}
      </div>
    </div>
  );
}
