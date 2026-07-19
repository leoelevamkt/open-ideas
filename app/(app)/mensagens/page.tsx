import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { listConversations, listMessages, getOtherPartyId, markMessagesRead, getUserById } from "@/lib/queries"
import { ChatPanel } from "@/components/messages/chat-panel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
}

export default async function MensagensPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { u } = await searchParams
  const conversations = await listConversations(user.id)

  // No mobile: sem ?u mostra só a lista; com ?u mostra só o chat.
  const hasSelection = Boolean(u)

  // Determina o interlocutor ativo
  let activeId: number | null = u ? Number(u) : null
  if (!activeId) {
    activeId = conversations[0]?.id ?? (await getOtherPartyId(user.id))
  }

  if (!activeId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Nenhum contato disponível para conversa.
        </CardContent>
      </Card>
    )
  }

  const other = await getUserById(activeId)
  if (!other) redirect("/mensagens")

  await markMessagesRead(user.id, activeId)
  const messages = await listMessages(user.id, activeId)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <aside className={cn("flex-col gap-2", hasSelection ? "hidden lg:flex" : "flex")}>
        <h3 className="px-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">Conversas</h3>
        {conversations.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">Nenhuma conversa.</p>
        ) : (
          conversations.map((c) => (
            <Link key={c.id} href={`/mensagens?u=${c.id}`}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  c.id === activeId ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.last_body ?? "Iniciar conversa"}</p>
                </div>
                {c.unread > 0 ? <Badge className="shrink-0">{c.unread}</Badge> : null}
              </div>
            </Link>
          ))
        )}
      </aside>

      <div className={cn(hasSelection ? "block" : "hidden lg:block")}>
        <ChatPanel currentUserId={user.id} other={other} messages={messages} />
      </div>
    </div>
  )
}
