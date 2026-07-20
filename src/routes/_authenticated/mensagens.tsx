import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Send, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mensagens")({
  component: MensagensPage,
});

function MensagensPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: contacts } = useQuery({
    queryKey: ["message-contacts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("profiles").select("id, name, email, avatar_label").neq("id", user.id).order("name");
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!selected && contacts?.length) setSelected(contacts[0].id);
  }, [contacts, selected]);

  const { data: messages } = useQuery({
    queryKey: ["messages", user?.id, selected],
    queryFn: async () => {
      if (!user || !selected) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selected}),and(sender_id.eq.${selected},recipient_id.eq.${user.id})`)
        .order("created_at");
      return data ?? [];
    },
    enabled: !!user && !!selected,
  });

  useEffect(() => {
    if (!user || !selected) return;
    const ch = supabase
      .channel(`msgs-${user.id}-${selected}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
        const m = payload.new;
        if ((m.sender_id === user.id && m.recipient_id === selected) || (m.sender_id === selected && m.recipient_id === user.id)) {
          qc.invalidateQueries({ queryKey: ["messages", user.id, selected] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, selected, qc]);

  const [text, setText] = useState("");
  const send = useMutation({
    mutationFn: async () => {
      if (!user || !selected || !text.trim()) return;
      const { error } = await supabase.from("messages").insert({ sender_id: user.id, recipient_id: selected, body: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["messages", user?.id, selected] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const [showChat, setShowChat] = useState(false);
  const activeContact = contacts?.find((c: any) => c.id === selected);

  return (
    <div className="-m-4 -mb-28 flex h-[calc(100dvh-3.5rem)] bg-background">
      {/* Contacts list — full width on mobile, sidebar on md+ */}
      <aside
        className={`${showChat ? "hidden" : "flex"} md:flex w-full md:w-64 flex-col md:border-r bg-card overflow-y-auto`}
      >
        <div className="p-3 border-b font-semibold text-sm sticky top-0 bg-card">Contatos</div>
        {!contacts?.length ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhum contato ainda.</p>
        ) : (
          <ul className="flex-1">
            {contacts.map((c: any) => (
              <li key={c.id}>
                <button
                  onClick={() => { setSelected(c.id); setShowChat(true); }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/60 hover:bg-muted/50 ${selected === c.id ? "bg-muted/40" : ""}`}
                >
                  <span className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
                    {c.avatar_label ?? c.name?.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Conversation — full width on mobile when a contact is picked */}
      <section className={`${showChat ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
        {activeContact && (
          <div className="flex items-center gap-2 border-b bg-card px-3 py-2">
            <button
              onClick={() => setShowChat(false)}
              className="md:hidden flex size-9 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-4" />
            </button>
            <span className="size-9 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
              {activeContact.avatar_label ?? activeContact.name?.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{activeContact.name}</div>
              <div className="text-xs text-muted-foreground truncate">{activeContact.email}</div>
            </div>
          </div>
        )}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
          {!selected ? (
            <p className="text-muted-foreground text-sm">Selecione um contato.</p>
          ) : !messages?.length ? (
            <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda.</p>
          ) : (
            messages.map((m: any) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm"}`}>
                    <div className="break-words">{m.body}</div>
                    <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {selected && (
          <form
            onSubmit={(e) => { e.preventDefault(); send.mutate(); }}
            className="flex gap-2 p-3 border-t bg-background safe-bottom"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 min-w-0 rounded-full border bg-background px-4 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={!text.trim() || send.isPending}
              className="shrink-0 rounded-full bg-primary text-primary-foreground size-10 grid place-items-center disabled:opacity-50"
              aria-label="Enviar"
            >
              <Send className="size-4" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
