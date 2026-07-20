import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/lib/types";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const authUser = s.session?.user;
      if (!authUser) return;
      const [{ data: profile }, { data: role }] = await Promise.all([
        supabase.from("profiles").select("id,name,email,avatar_label").eq("id", authUser.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", authUser.id).maybeSingle(),
      ]);
      if (!mounted || !profile) return;
      setUser({
        id: profile.id as string,
        name: (profile as any).name ?? authUser.email ?? "",
        email: (profile as any).email ?? authUser.email ?? "",
        avatar_label: (profile as any).avatar_label ?? null,
        role: ((role as any)?.role ?? "cliente"),
      });

      const [{ count: mc }, { count: nc }] = await Promise.all([
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("recipient_id", authUser.id).eq("read", false),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", authUser.id).eq("read", false),
      ]);
      if (mounted) {
        setUnreadMessages(mc ?? 0);
        setUnreadNotifications(nc ?? 0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!user) {
    return <div className="flex min-h-[100dvh] items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} name={user.name} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
      <SidebarInset>
        <AppHeader name={user.name} email={user.email} role={user.role} avatarLabel={user.avatar_label} />
        <div className="flex-1 p-4 pb-28"><Outlet /></div>
        <BottomNav role={user.role} />
      </SidebarInset>
    </SidebarProvider>
  );
}
