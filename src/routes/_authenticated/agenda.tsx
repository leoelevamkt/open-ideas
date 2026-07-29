import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Trash2, Video } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { HearingFormDialog } from "@/components/dialogs/hearing-form-dialog";
import { HearingPreviewDialog } from "@/components/dialogs/hearing-preview-dialog";
import { listHearings, getClientByUserId, deleteHearing } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, relativeDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/agenda")({ component: AgendaPage });

function AgendaPage() {
  const { user, isStaff, canEdit } = useAuth();
  const isLawyer = isStaff;
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data = [] } = useQuery({
    enabled: !!user,
    queryKey: ["hearings", isLawyer, clientId],
    queryFn: () => listHearings(isLawyer ? undefined : clientId ?? undefined),
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.filter((h: any) => h.hearing_date >= today);
  const past = data.filter((h: any) => h.hearing_date < today);

  const qc = useQueryClient();

  async function onDelete(id: string) {
    if (!confirm("Excluir esta audiência?")) return;
    try {
      await deleteHearing(id);
      toast.success("Audiência excluída.");
      qc.invalidateQueries({ queryKey: ["hearings"] });
      qc.invalidateQueries({ queryKey: ["hearings-all"] });
    } catch (e: any) { toast.error(e.message); }
  }

  const [preview, setPreview] = useState<any | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Agenda e audiências" subtitle="Compromissos organizados por data." />
      {canEdit && <div className="flex justify-end"><HearingFormDialog /></div>}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximas</h2>
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma audiência agendada.</p>}
        {upcoming.map((h: any) => <HearingCard key={h.id} h={h} canEdit={canEdit} onDelete={onDelete} onPreview={setPreview} />)}
      </section>

      {past.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Realizadas</h2>
          {past.slice(0, 10).map((h: any) => <HearingCard key={h.id} h={h} past canEdit={canEdit} onDelete={onDelete} onPreview={setPreview} />)}
        </section>
      )}

      <HearingPreviewDialog hearing={preview} open={!!preview} onOpenChange={(o: boolean) => !o && setPreview(null)} />
    </div>
  );
}

function HearingCard({ h, past, canEdit, onDelete, onPreview }: { h: any; past?: boolean; canEdit?: boolean; onDelete?: (id: string) => void; onPreview?: (h: any) => void }) {
  return (
    <Card
      className={`cursor-pointer transition hover:border-gold/50 ${past ? "opacity-70" : ""}`}
      onClick={() => onPreview?.(h)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-[10px] font-semibold uppercase">{new Date(h.hearing_date).toLocaleDateString("pt-BR",{month:"short"}).replace(".","")}</span>
            <span className="text-lg font-bold leading-none">{new Date(h.hearing_date).getDate()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium">{h.title}</p>
              <Badge variant="outline">{h.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(h.hearing_date)}{h.hearing_time ? ` · ${h.hearing_time.slice(0,5)}` : ""}{!past && ` · ${relativeDate(h.hearing_date)}`}</p>
            {h.client_name && <p className="mt-0.5 truncate text-xs text-muted-foreground">Cliente: {h.client_name}</p>}
            {h.case_title && <p className="truncate text-xs text-muted-foreground">Processo: {h.case_number ? `Nº ${h.case_number} — ` : ""}{h.case_title}</p>}
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {h.location && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{h.location}</span>}
              {h.link && <a href={h.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-gold-strong hover:underline"><Video className="size-3" />Acessar sala</a>}
            </div>
            {canEdit && (
              <div className="mt-2 flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                <HearingFormDialog hearing={h} />
                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete?.(h.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

