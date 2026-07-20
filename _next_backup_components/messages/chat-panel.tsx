"use client"

import { useState, useRef, useEffect, startTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Send, ArrowLeft } from "lucide-react"
import type { Message, User } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { sendMessageAction } from "@/lib/actions"
import { formatTime } from "@/lib/format"

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
}

export function ChatPanel({
  currentUserId,
  other,
  messages,
}: {
  currentUserId: number
  other: User
  messages: Message[]
}) {
  const router = useRouter()
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling simples para receber novas mensagens
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(interval)
  }, [router])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    const fd = new FormData()
    fd.set("recipient_id", String(other.id))
    fd.set("body", body)
    setText("")
    startTransition(async () => {
      await sendMessageAction(fd)
      router.refresh()
    })
  }

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100vh-9rem)]">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Voltar para conversas"
          nativeButton={false}
          render={<Link href="/mensagens" />}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">{initials(other.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{other.name}</p>
          <p className="text-xs capitalize text-muted-foreground">{other.role}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Inicie a conversa.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-foreground shadow-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatTime(m.created_at.slice(11, 16))}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Enviar mensagem">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
