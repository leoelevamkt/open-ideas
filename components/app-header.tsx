"use client"

import Image from "next/image"
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
  "/financeiro": "Financeiro",
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
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border/70 bg-background/85 px-2 backdrop-blur-md safe-top">
      <SidebarTrigger className="size-9" />
      <div className="flex flex-1 items-center justify-center gap-2">
        <span className="flex size-7 items-center justify-center overflow-hidden rounded-md ring-1 ring-gold/30">
          <Image src="/brand-mark.png" alt="" aria-hidden="true" width={28} height={28} className="size-7 object-cover" />
        </span>
        <h1 className="truncate font-heading text-lg font-semibold tracking-refined text-foreground">
          {title}
        </h1>
      </div>

      <div>
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
