"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CalendarClock,
  FileText,
  MessageSquare,
  Bell,
  BarChart3,
  User,
  LogOut,
} from "lucide-react"
import type { Role } from "@/lib/types"
import { BrandLogo } from "@/components/brand-logo"
import { logoutAction } from "@/lib/actions"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  roles: Role[]
  badge?: number
}

export function AppSidebar({
  role,
  name,
  unreadMessages,
  unreadNotifications,
}: {
  role: Role
  name: string
  unreadMessages: number
  unreadNotifications: number
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const closeDrawer = () => setOpenMobile(false)

  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["advogado", "cliente"] },
    { href: "/clientes", label: "Clientes", icon: Users, roles: ["advogado"] },
    { href: "/processos", label: "Processos", icon: FolderKanban, roles: ["advogado", "cliente"] },
    { href: "/agenda", label: "Agenda e Audiências", icon: CalendarClock, roles: ["advogado", "cliente"] },
    { href: "/agenda-prazos", label: "Agenda de Prazos", icon: CalendarClock, roles: ["advogado", "cliente"] },
    { href: "/documentos", label: "Documentos", icon: FileText, roles: ["advogado", "cliente"] },
    {
      href: "/mensagens",
      label: "Mensagens",
      icon: MessageSquare,
      roles: ["advogado", "cliente"],
      badge: unreadMessages,
    },
    {
      href: "/notificacoes",
      label: "Notificações",
      icon: Bell,
      roles: ["advogado", "cliente"],
      badge: unreadNotifications,
    },
    { href: "/relatorios", label: "Relatórios", icon: BarChart3, roles: ["advogado", "cliente"] },
  ]

  const visible = items.filter((i) => i.roles.includes(role))
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="gap-3 border-b border-sidebar-border p-4">
        <BrandLogo variant="plate" className="h-12 w-full px-3 py-2" priority />
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{name}</p>
            <span className="text-xs capitalize text-sidebar-foreground/60">{role}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>
            {role === "advogado" ? "Escritório" : "Meu Espaço"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {visible.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={active}
                      onClick={closeDrawer}
                      className="gap-3 rounded-xl px-3 [&_svg]:size-5"
                      render={<Link href={item.href} />}
                    >
                      <Icon aria-hidden="true" />
                      <span className="text-[15px]">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <Badge className="ml-auto bg-accent text-accent-foreground">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              isActive={pathname.startsWith("/perfil")}
              onClick={closeDrawer}
              className="gap-3 rounded-xl px-3 [&_svg]:size-5"
              render={<Link href="/perfil" />}
            >
              <User aria-hidden="true" />
              <span className="text-[15px]">Meu Perfil</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logoutAction} className="w-full">
              <SidebarMenuButton
                size="lg"
                type="submit"
                className="w-full gap-3 rounded-xl px-3 text-sidebar-foreground/80 [&_svg]:size-5"
              >
                <LogOut aria-hidden="true" />
                <span className="text-[15px]">Sair</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
