import { CalendarClock, Clock, MapPin, Video, User, Scale, FileText, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { formatDate, relativeDate } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { HearingFormDialog } from "@/components/dialogs/hearing-form-dialog";

export function HearingPreviewDialog({
  hearing,
  open,
  onOpenChange,
}: {
  hearing: any | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { canEdit } = useAuth();
  if (!hearing) return null;

  const past = hearing.hearing_date < new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-balance">{hearing.title}</DialogTitle>
              <DialogDescription>Prévia do compromisso.</DialogDescription>
            </div>
            <Badge variant="outline" className="shrink-0">{hearing.type}</Badge>
          </div>
        </DialogHeader>

        <section className="flex flex-col gap-2 text-sm">
          <Row
            icon={<CalendarClock className="size-4" />}
            label="Data"
            value={`${formatDate(hearing.hearing_date)}${past ? "" : ` · ${relativeDate(hearing.hearing_date)}`}`}
          />
          {hearing.hearing_time && (
            <Row icon={<Clock className="size-4" />} label="Horário" value={hearing.hearing_time.slice(0, 5)} />
          )}
          {hearing.client_name && (
            <Row icon={<User className="size-4" />} label="Cliente" value={hearing.client_name} />
          )}
          {hearing.case_number && (
            <Row icon={<Scale className="size-4" />} label="Nº do processo" value={hearing.case_number} />
          )}
          {hearing.case_title && (
            <Row icon={<FileText className="size-4" />} label="Processo" value={hearing.case_title} />
          )}
          {hearing.location && (
            <Row icon={<MapPin className="size-4" />} label="Local" value={hearing.location} />
          )}
        </section>

        {hearing.link && (
          <a
            href={hearing.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gold-strong hover:underline"
          >
            <Video className="size-4" /> Acessar sala virtual
            <Link2 className="size-3.5" />
          </a>
        )}

        {hearing.notes && (
          <>
            <Separator />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observações</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{hearing.notes}</p>
            </div>
          </>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {hearing.case_id && (
            <Button asChild variant="outline" size="sm">
              <Link
                to={"/processos/$id" as any}
                params={{ id: hearing.case_id } as any}
                onClick={() => onOpenChange(false)}
              >
                Ver processo
              </Link>
            </Button>
          )}
          {canEdit && <HearingFormDialog hearing={hearing} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words">{value}</p>
      </div>
    </div>
  );
}
