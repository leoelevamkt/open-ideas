import { Link, useLocation } from "@tanstack/react-router";
import { Home, Scale, Users, Calendar, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: typeof Home };

const lawyerItems: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/processos", label: "Processos", icon: Scale },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
];

const clientItems: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/processos", label: "Processos", icon: Scale },
  { href: "/agenda-prazos", label: "Agenda", icon: Calendar },
];

export function BottomNav({ role, onOpenMenu }: { role: Role | null; onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const items = role === "advogado" ? lawyerItems : clientItems;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur safe-bottom"
    >
      <div className="flex items-stretch">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  active ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
        >
          <span className="flex h-8 w-14 items-center justify-center rounded-full">
            <Menu className="h-5 w-5" />
          </span>
          Menu
        </button>
      </div>
    </nav>
  );
}
