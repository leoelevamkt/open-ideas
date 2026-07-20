import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FolderKanban, CalendarClock,
  FileText, MessageSquare, Bell, BarChart3, User as UserIcon, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["advogado", "cliente"] },
  { href: "/clientes", label: "Clientes", icon: Users, roles: ["advogado"] },
  { href: "/processos", label: "Processos", icon: FolderKanban, roles: ["advogado", "cliente"] },
  { href: "/agenda", label: "Agenda e Audiências", icon: CalendarClock, roles: ["advogado", "cliente"] },
  { href: "/agenda-prazos", label: "Agenda de Prazos", icon: CalendarClock, roles: ["advogado", "cliente"] },
  { href: "/documentos", label: "Documentos", icon: FileText, roles: ["advogado", "cliente"] },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare, roles: ["advogado", "cliente"] },
  { href: "/notificacoes", label: "Notificações", icon: Bell, roles: ["advogado", "cliente"] },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, roles: ["advogado", "cliente"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV.filter((i) => !role || i.roles.includes(role));
  const initials = profile?.avatar_label || (profile?.name?.slice(0, 2).toUpperCase() ?? "US");
  const currentTitle =
    items.find((i) => location.pathname === i.href || location.pathname.startsWith(i.href + "/"))?.label
    ?? "Portal Jurídico";

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <SidebarInner items={items} pathname={location.pathname} initials={initials}
          name={profile?.name ?? ""} role={role} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex justify-end p-2">
              <button onClick={() => setMobileOpen(false)} className="p-2"><X className="size-5" /></button>
            </div>
            <SidebarInner items={items} pathname={location.pathname} initials={initials}
              name={profile?.name ?? ""} role={role} onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
          <button className="md:hidden p-2" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          <h1 className="flex-1 truncate text-base font-semibold">{currentTitle}</h1>
          <Link to="/perfil" className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </span>
          </Link>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  items, pathname, initials, name, role, onLogout, onNavigate,
}: {
  items: NavItem[]; pathname: string; initials: string;
  name: string; role: Role | null; onLogout: () => void; onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-sidebar-border p-4">
        <BrandLogo variant="plate" className="w-full h-14 mb-3" />
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <span className="text-xs capitalize text-sidebar-foreground/60">{role}</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-auto p-2 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} to={item.href} onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                       : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <Link to="/perfil" onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent">
          <UserIcon className="size-4" /> Meu perfil
        </Link>
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
          <LogOut className="size-4" /> Sair
        </button>
      </div>
    </div>
  );
}
