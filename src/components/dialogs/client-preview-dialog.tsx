import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MessageCircle, MapPin, Calendar, IdCard, FileText, Scale } from "lucide-react";
import type { Client } from "@/lib/types";
import { listCases, listDocuments } from "@/lib/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { ClientFormDialog } from "@/components/dialogs/client-form-dialog";

export function ClientPreviewDialog({
  client,
  open,
  onOpenChange,
}: {
  client: Client | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { canEdit } = useAuth();
  const id = client?.id;

  const { data: cases = [] } = useQuery({
    enabled: !!id && open,
    queryKey: ["client-cases", id],
    queryFn: () => listCases(id!),
  });
  const { data: docs = [] } = useQuery({
    enabled: !!id && open,
    queryKey: ["client-docs", id],
    queryFn: () => listDocuments({ clientId: id! }),
  });

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-balance">{client.full_name}</DialogTitle>
              <DialogDescription>Prévia das informações do cliente.</DialogDescription>
            </div>
            <Badge variant={client.status === "ativo" ? "default" : "secondary"}>{client.status}</Badge>
          </div>
        </DialogHeader>

        <section className="flex flex-col gap-2 text-sm">
          {client.cpf && <Row icon={<IdCard className="size-4" />} label="CPF/CNPJ" value={client.cpf} />}
          {client.rg && <Row icon={<IdCard className="size-4" />} label="RG" value={client.rg} />}
          {client.birth_date && (
            <Row icon={<Calendar className="size-4" />} label="Nascimento" value={formatDate(client.birth_date)} />
          )}
          {client.email && <Row icon={<Mail className="size-4" />} label="E-mail" value={client.email} />}
          {client.phone && <Row icon={<Phone className="size-4" />} label="Telefone" value={client.phone} />}
          {client.whatsapp && (
            <Row icon={<MessageCircle className="size-4" />} label="WhatsApp" value={client.whatsapp} />
          )}
          {client.address && <Row icon={<MapPin className="size-4" />} label="Endereço" value={client.address} />}
          {client.notes && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">{client.notes}</p>
            </>
          )}
        </section>

        <Separator />

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Processos ({cases.length})
          </h3>
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum processo vinculado.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {cases.map(c => (
                <Link
                  key={c.id}
                  to={"/processos/$id" as any}
                  params={{ id: c.id } as any}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2.5 text-sm transition hover:border-gold/50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Scale className="size-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">Nº {c.number}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{c.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Documentos ({docs.length})
          </h3>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {docs.slice(0, 6).map(d => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2.5 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{d.name}</span>
                  </div>
                  <Badge variant={d.status === "disponivel" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {canEdit && (
          <div className="flex justify-end pt-2">
            <ClientFormDialog client={client} />
          </div>
        )}
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
