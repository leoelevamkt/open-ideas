import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FolderKanban, CalendarClock,
  FileText, MessageSquare, Bell, BarChart3, User as UserIcon, LogOut, X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "./brand-logo";
import { BottomNav } from "./bottom-nav";
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

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Gestão de Clientes",
  "/processos": "Gestão de Processos",
  "/agenda": "Agenda e Audiências",
  "/agenda-prazos": "Agenda de Prazos",
  "/documentos": "Central de Documentos",
  "/mensagens": "Mensagens",
  "/notificacoes": "Notificações",
  "/relatorios": "Relatórios",
  "/perfil": "Meu Perfil",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = NAV.filter((i) => !role || i.roles.includes(role));
  const initials = profile?.avatar_label || (profile?.name?.slice(0, 2).toUpperCase() ?? "US");
  const title =
    Object.keys(TITLES).find((k) => pathname === k || pathname.startsWith(k + "/"))
      ? TITLES[Object.keys(TITLES).find((k) => pathname === k || pathname.startsWith(k + "/"))!]
      : "Guimarães & Guedes Advocacia";

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="app-ambient">
      <div className="app-frame flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-2 backdrop-blur safe-top">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex size-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 className="flex-1 truncate text-center text-base font-semibold text-foreground">{title}</h1>
          <Link
            to="/perfil"
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </span>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 pb-28">{children}</main>

        {/* Bottom nav */}
        <BottomNav role={role} onOpenMenu={() => setDrawerOpen(true)} />

        {/* Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground shadow-2xl flex flex-col">
              <div className="border-b border-sidebar-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <BrandLogo variant="plate" className="h-12 px-3 py-2" />
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-md hover:bg-sidebar-accent"
                    aria-label="Fechar"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">{profile?.name}</p>
                    <span className="text-xs capitalize text-sidebar-foreground/60">{role}</span>
                  </div>
                </div>
              </div>
              <nav className="flex-1 overflow-auto p-2 space-y-1">
                <p className="px-3 py-2 text-xs uppercase tracking-wider text-sidebar-foreground/50">
                  {role === "advogado" ? "Escritório" : "Meu Espaço"}
                </p>
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
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
                <Link
                  to="/perfil"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
                >
                  <UserIcon className="size-4" /> Meu perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Sair
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
