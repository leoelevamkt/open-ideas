import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, Scale } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CaseFormDialog } from "@/components/dialogs/case-form-dialog";
import { listCases, listCasesWithClient, getClientByUserId } from "@/lib/queries";
import { useAuth } from "@/lib/auth-context";
import { CASE_STATUSES, LEGAL_AREAS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/processos/")({ component: ProcessosPage });

const SORT_LABELS: Record<string, string> = {
  updated_desc: "Atualização (mais recente)",
  updated_asc: "Atualização (mais antiga)",
  created_desc: "Criação (mais recente)",
  created_asc: "Criação (mais antiga)",
  title_asc: "Título (A–Z)",
  title_desc: "Título (Z–A)",
};

function statusColor(s: string) {
  if (s === "Em Andamento") return "bg-blue-100 text-blue-700";
  if (s === "Audiência Marcada") return "bg-amber-100 text-amber-700";
  if (s === "Sentenciado" || s === "Finalizado") return "bg-emerald-100 text-emerald-700";
  if (s === "Arquivado") return "bg-muted text-muted-foreground";
  return "bg-gold/15 text-gold-strong";
}

function ProcessosPage() {
  const { user, isStaff, canEdit } = useAuth();
  const isLawyer = isStaff;
  const [clientId, setClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [areaFilter, setAreaFilter] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window === "undefined") return "updated_desc";
    return window.localStorage.getItem("processos-sort") ?? "updated_desc";
  });
  useEffect(() => {
    try { window.localStorage.setItem("processos-sort", sortBy); } catch {}
  }, [sortBy]);

  useEffect(() => {
    if (!user || isLawyer) return;
    getClientByUserId(user.id).then(c => setClientId(c?.id ?? null));
  }, [user, isLawyer]);

  const { data = [] } = useQuery({
    enabled: !!user,
    queryKey: ["cases", isLawyer, clientId],
    queryFn: async () => isLawyer ? await listCasesWithClient() : await listCases(clientId ?? undefined),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = data.filter((c: any) => {
      const matchQ = !q || c.title.toLowerCase().includes(q) || c.number?.toLowerCase().includes(q);
      const matchS = statusFilter === "todos" || c.status === statusFilter;
      const matchA = areaFilter === "todas" || c.legal_area === areaFilter;
      return matchQ && matchS && matchA;
    });
    const sorted = [...list].sort((a: any, b: any) => {
      switch (sortBy) {
        case "title_asc": return (a.title ?? "").localeCompare(b.title ?? "", "pt-BR");
        case "title_desc": return (b.title ?? "").localeCompare(a.title ?? "", "pt-BR");
        case "updated_asc": return new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime();
        case "updated_desc": return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
        case "created_asc": return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
        case "created_desc": return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        default: return 0;
      }
    });
    return sorted;
  }, [data, search, statusFilter, areaFilter, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      <PageHero title="Processos judiciais" subtitle="Acompanhe cada etapa com transparência." />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por título ou número…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {canEdit && <CaseFormDialog />}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v ?? "todas")}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de processo">
              {areaFilter === "todas" ? "Todos os tipos" : areaFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os tipos</SelectItem>
            {LEGAL_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "updated_desc")}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por">{SORT_LABELS[sortBy]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {(["todos", ...CASE_STATUSES] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {s === "todos" ? "Todos" : s}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((c: any) => (
          <Link key={c.id} to={"/processos/$id" as any} params={{ id: c.id } as any} className="block">
            <Card className="transition hover:border-gold/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Scale className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.title}</p>
                      <Badge className={statusColor(c.status)} variant="secondary">{c.status}</Badge>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{c.number}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {c.client_name && <span>Cliente: {c.client_name}</span>}
                      {c.legal_area && <span>· {c.legal_area}</span>}
                      {c.updated_at && <span>· Atualizado {formatDate(c.updated_at)}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum processo encontrado.</p>}
      </div>
    </div>
  );
}
