import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listCases, listCasesWithClient, getClientByUserId } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/processos")({
  component: ProcessosPage,
});

function ProcessosPage() {
  const [role, setRole] = useState<"advogado" | "cliente" | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user; if (!u) return;
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.id).maybeSingle();
      const roleValue = (((r as any)?.role) ?? "cliente") as "advogado" | "cliente";
      setRole(roleValue);
      if (roleValue === "cliente") {
        const c = await getClientByUserId(u.id);
        setClientId(c?.id ?? null);
      }
    })();
  }, []);

  const { data = [] } = useQuery({
    enabled: !!role,
    queryKey: ["cases", role, clientId],
    queryFn: async () => role === "advogado" ? await listCasesWithClient() : await listCases(clientId ?? undefined),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Processos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe todos os processos ativos.</p>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((c: any) => (
          <Link key={c.id} to={"/processos/$id" as any} params={{ id: c.id }} className="block">
            <Card className="transition hover:border-accent/50">
              <CardContent className="flex flex-col gap-1 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <Badge variant="outline">{c.status}</Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">Nº {c.number}</p>
                {c.client_name && <p className="truncate text-xs text-muted-foreground">Cliente: {c.client_name}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">Nenhum processo cadastrado.</p>}
      </div>
    </div>
  );
}
