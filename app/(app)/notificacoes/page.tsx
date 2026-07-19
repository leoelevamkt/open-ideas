import { redirect } from "next/navigation"
import { Bell, CalendarClock, FileText, MessageSquare, Activity, CheckCheck } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { listNotifications } from "@/lib/queries"
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnablePushButton } from "@/components/notifications/enable-push-button"
import { cn } from "@/lib/utils"
import { relativeDate } from "@/lib/format"
import type { Notification } from "@/lib/types"

const ICONS: Record<string, typeof Bell> = {
  audiencia: CalendarClock,
  documento: FileText,
  mensagem: MessageSquare,
  movimentacao: Activity,
  info: Bell,
}

export default async function NotificacoesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const notifications = await listNotifications(user.id)
  const hasUnread = notifications.some((n) => n.read === 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">Notificações no celular</p>
          <p className="text-xs text-muted-foreground text-pretty">
            Receba avisos de audiências, mensagens e movimentações mesmo com o app fechado.
          </p>
        </div>
        <EnablePushButton />
      </div>

      {hasUnread ? (
        <form action={markAllNotificationsReadAction} className="flex justify-end">
          <Button type="submit" variant="outline" size="sm">
            <CheckCheck className="mr-1 h-4 w-4" /> Marcar todas como lidas
          </Button>
        </form>
      ) : null}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Você não tem notificações.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n: Notification) => {
            const Icon = ICONS[n.type] ?? Bell
            return (
              <Card key={n.id} className={cn(n.read === 0 && "border-primary/30 bg-primary/5")}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      n.read === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {n.read === 0 ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
                    </div>
                    {n.description ? <p className="mt-0.5 text-sm text-muted-foreground">{n.description}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">{relativeDate(n.created_at)}</p>
                  </div>
                  {n.read === 0 ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Marcar lida
                      </Button>
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
