import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Gestão de Clientes",
  "/processos": "Gestão de Processos",
  "/agenda": "Agenda e Audiências",
  "/agenda-prazos": "Agenda de Prazos",
  "/documentos": "Central de Documentos",
  "/financeiro": "Financeiro",
  "/mensagens": "Mensagens",
  "/notificacoes": "Notificações",
  "/relatorios": "Relatórios",
  "/perfil": "Meu Perfil",
};

function titleFromPath(pathname: string): string {
  const match = Object.keys(TITLES).find((k) => pathname === k || pathname.startsWith(k + "/"));
  return match ? TITLES[match] : "Guimarães & Guedes Advocacia";
}

export function AppHeader({
  name, email, role, avatarLabel,
}: { name: string; email: string; role: string; avatarLabel: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleFromPath(pathname);
  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border/70 bg-background/85 px-2 backdrop-blur-md safe-top">
      <SidebarTrigger className="size-9" />
      <div className="flex flex-1 items-center justify-center gap-2">
        <span className="flex size-7 items-center justify-center overflow-hidden rounded-md ring-1 ring-gold/30">
          <img src="/brand-mark.png" alt="" aria-hidden="true" className="size-7 object-cover" />
        </span>
        <h1 className="truncate font-heading text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-9 rounded-full">
              <Avatar className="size-8 ring-2 ring-accent/60">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {avatarLabel ?? name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{email}</span>
                <span className="mt-1 text-xs font-normal capitalize text-muted-foreground">Perfil: {role}</span>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link to={"/perfil" as any} />}>
            <UserIcon className="mr-2 size-4" aria-hidden="true" />
            Meu perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="mr-2 size-4" aria-hidden="true" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
