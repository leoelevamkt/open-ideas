import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Portal em migração — telas restantes sendo portadas.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Processos","/processos"],["Clientes","/clientes"],
          ["Agenda","/agenda"],["Documentos","/documentos"],
          ["Mensagens","/mensagens"],["Perfil","/perfil"],
        ].map(([label,to]) => (
          <Card key={to}>
            <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
            <CardContent>
              <Link to={to as any} className="text-sm text-primary underline">Abrir</Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}>
        Sair
      </Button>
    </div>
  );
}
