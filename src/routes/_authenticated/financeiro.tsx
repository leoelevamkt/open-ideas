import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/financeiro")({
  component: FinanceiroPage,
});

function FinanceiroPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Faturas e pagamentos.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wallet className="size-4" /> Em breve</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Módulo financeiro será liberado nos próximos releases.</p></CardContent>
      </Card>
    </div>
  );
}
