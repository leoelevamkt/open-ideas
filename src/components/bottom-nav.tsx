import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Scale, Users, Calendar, Wallet, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

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
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

export function BottomNav({ role }: { role: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  const items = role === "advogado" ? lawyerItems : clientItems;

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <nav
        aria-label="Navegação principal"
        className="pointer-events-auto flex items-stretch justify-between gap-1 rounded-2xl border border-border/60 bg-primary/95 p-1.5 text-primary-foreground shadow-[0_12px_32px_-8px_rgb(0_0_0/0.45)] backdrop-blur-md ring-1 ring-gold/15"
      >
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href as any}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors",
                active ? "bg-gold text-primary" : "text-primary-foreground/60",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className={cn(active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium text-primary-foreground/60 transition-colors"
        >
          <Menu className="h-[18px] w-[18px]" />
          Menu
        </button>
      </nav>
    </div>
  );
}
