import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listNotifications } from "@/lib/queries";
import type { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user; if (!u) return;
      const list = await listNotifications(u.id);
      setItems(list);
      await supabase.from("notifications").update({ read: true }).eq("user_id", u.id).eq("read", false);
    })();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Notificações</h1>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Bell className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                {n.description && <p className="text-xs text-muted-foreground">{n.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Sem notificações.</p>}
      </div>
    </div>
  );
}
