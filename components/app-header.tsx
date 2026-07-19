"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User as UserIcon } from "lucide-react"
import { logoutAction } from "@/lib/actions"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Gestão de Clientes",
  "/processos": "Gestão de Processos",
  "/agenda": "Agenda e Audiências",
  "/documentos": "Central de Documentos",
  "/mensagens": "Mensagens",
  "/notificacoes": "Notificações",
  "/relatorios": "Relatórios",
}

function titleFromPath(pathname: string): string {
  const match = Object.keys(TITLES).find(
    (key) => pathname === key || pathname.startsWith(key + "/"),
  )
  return match ? TITLES[match] : "Guimarães & Guedes Advocacia"
}

export function AppHeader({
  name,
  email,
  role,
  avatarLabel,
}: {
  name: string
  email: string
  role: string
  avatarLabel: string | null
}) {
  const pathname = usePathname()
  const title = titleFromPath(pathname)
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-2 backdrop-blur safe-top">
      <SidebarTrigger className="size-9" />
      <h1 className="flex-1 truncate text-center text-base font-semibold text-foreground">{title}</h1>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-9 rounded-full">
                <Avatar className="size-8">
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
                  <span className="mt-1 text-xs font-normal capitalize text-muted-foreground">
                    Perfil: {role}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/perfil" />}>
              <UserIcon className="mr-2 size-4" aria-hidden="true" />
              Meu perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center text-destructive">
                    <LogOut className="mr-2 size-4" aria-hidden="true" />
                    Sair
                  </button>
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
