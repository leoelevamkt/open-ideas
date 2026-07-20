import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listMessagesBetween, markMessagesRead, getOtherPartyId } from "@/lib/queries";
import type { Message } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mensagens")({
  component: MensagensPage,
});

function MensagensPage() {
  const [me, setMe] = useState<string | null>(null);
  const [other, setOther] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user; if (!u) return;
      setMe(u.id);
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.id).maybeSingle();
      const role = ((r as any)?.role ?? "cliente") as "advogado" | "cliente";
      const otherId = await getOtherPartyId(u.id, role);
      setOther(otherId);
      if (otherId) {
        const msgs = await listMessagesBetween(u.id, otherId);
        setMessages(msgs);
        await markMessagesRead(u.id, otherId);
      }
    })();
  }, []);

  useEffect(() => {
    if (!me || !other) return;
    const ch = supabase.channel(`chat-${me}-${other}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Message;
        if ((m.sender_id === me && m.recipient_id === other) || (m.sender_id === other && m.recipient_id === me)) {
          setMessages((prev) => [...prev, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me, other]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!body.trim() || !me || !other) return;
    const text = body.trim();
    setBody("");
    await supabase.from("messages").insert({ sender_id: me, recipient_id: other, body: text, read: false });
  };

  return (
    <div className="flex h-[calc(100dvh-11rem)] flex-col gap-3">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Mensagens</h1>
      </div>
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {messages.length === 0 && <p className="m-auto text-sm text-muted-foreground">Sem mensagens ainda.</p>}
          {messages.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </CardContent>
      </Card>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input placeholder="Escreva uma mensagem…" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button type="submit" size="icon" disabled={!other}><Send className="size-4" /></Button>
      </form>
    </div>
  );
}
