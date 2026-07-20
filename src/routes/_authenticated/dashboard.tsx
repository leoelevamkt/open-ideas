import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { profile, role } = useAuth();
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Olá, {profile?.name}</h2>
        <p className="text-muted-foreground text-sm capitalize">Perfil: {role}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Clientes ativos" value="—" />
        <Card title="Processos em andamento" value="—" />
        <Card title="Audiências desta semana" value="—" />
      </div>
      <div className="rounded-lg border p-6 bg-card">
        <h3 className="font-semibold mb-2">Bem-vindo ao Portal Jurídico</h3>
        <p className="text-sm text-muted-foreground">
          Use o menu ao lado para navegar entre clientes, processos, audiências, documentos, mensagens e relatórios.
        </p>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-5 bg-card">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
