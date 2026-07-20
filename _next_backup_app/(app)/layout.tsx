import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { countUnreadMessages, countUnreadNotifications } from "@/lib/queries"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const unreadMessages = await countUnreadMessages(user.id)
  const unreadNotifications = await countUnreadNotifications(user.id)

  return (
    <SidebarProvider>
      <AppSidebar
        role={user.role}
        name={user.name}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications}
      />
      <SidebarInset>
        <AppHeader
          name={user.name}
          email={user.email}
          role={user.role}
          avatarLabel={user.avatar_label}
        />
        <div className="flex-1 p-4 pb-28">{children}</div>
        <BottomNav role={user.role} />
      </SidebarInset>
    </SidebarProvider>
  )
}
