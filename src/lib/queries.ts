import { supabase } from "@/integrations/supabase/client";
import type { Client, Case, Hearing, DocumentItem, Message, Notification, TimelineEvent } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export async function listClients(status?: "ativo" | "arquivado") {
  let q = supabase.from("clients").select("*").order("full_name");
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getClientByUserId(userId: string) {
  const { data } = await supabase.from("clients").select("*").eq("user_id", userId).maybeSingle();
  return data as Client | null;
}

export async function listCases(clientId?: string) {
  let q = supabase.from("cases").select("*").order("updated_at", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Case[];
}

export async function listCasesWithClient() {
  const { data, error } = await supabase
    .from("cases")
    .select("*, client:clients(full_name)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c: any) => ({ ...c, client_name: c.client?.full_name ?? null })) as Array<Case & { client_name: string | null }>;
}

export async function getCase(id: string) {
  const { data } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  return data as Case | null;
}

export async function listTimeline(caseId: string) {
  const { data, error } = await supabase.from("timeline_events").select("*").eq("case_id", caseId).order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TimelineEvent[];
}

export async function listHearings(clientId?: string) {
  const { data, error } = await supabase
    .from("hearings")
    .select("*, case:cases(title, client_id, client:clients(full_name)), client:clients(full_name)")
    .order("hearing_date");
  if (error) throw error;
  let out = (data ?? []).map((h: any) => ({
    ...h,
    case_title: h.case?.title ?? null,
    client_name: h.client?.full_name ?? h.case?.client?.full_name ?? null,
    effective_client_id: h.client_id ?? h.case?.client_id ?? null,
  }));
  if (clientId) out = out.filter((h: any) => h.effective_client_id === clientId);
  return out;
}

export async function getUpcomingHearings() {
  const { data, error } = await supabase
    .from("hearings")
    .select("*, case:cases(*, client:clients(*))")
    .gte("hearing_date", today())
    .order("hearing_date");
  if (error) throw error;
  return data ?? [];
}

export async function listDocuments(opts?: { clientId?: string; caseId?: string }) {
  let q = supabase.from("documents").select("*, client:clients(full_name), uploader:profiles!documents_uploaded_by_fkey(name)").order("created_at", { ascending: false });
  if (opts?.clientId) q = q.eq("client_id", opts.clientId);
  if (opts?.caseId) q = q.eq("case_id", opts.caseId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, client_name: d.client?.full_name ?? null, uploader_name: d.uploader?.name ?? null })) as Array<DocumentItem & { client_name: string | null; uploader_name: string | null }>;
}

export async function listMessagesBetween(a: string, b: string) {
  const { data, error } = await supabase
    .from("messages").select("*")
    .or(`and(sender_id.eq.${a},recipient_id.eq.${b}),and(sender_id.eq.${b},recipient_id.eq.${a})`)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function markMessagesRead(userId: string, otherId: string) {
  await supabase.from("messages").update({ read: true }).eq("recipient_id", userId).eq("sender_id", otherId);
}

export async function listNotifications(userId: string) {
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function lawyerStats() {
  const [{ count: c1 }, { count: c2 }, { count: c3 }, { count: c4 }] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    (() => {
      const end = new Date(); end.setDate(end.getDate() + 7);
      return supabase.from("hearings").select("*", { count: "exact", head: true }).gte("hearing_date", today()).lte("hearing_date", end.toISOString().slice(0, 10));
    })(),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pendente"),
  ]);
  return { clients: c1 ?? 0, cases: c2 ?? 0, hearingsWeek: c3 ?? 0, pendingDocs: c4 ?? 0 };
}

export async function clientStats(clientId: string) {
  const [{ count: c1 }, { count: c2 }] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("client_id", clientId).not("status", "in", "(Arquivado,Finalizado)"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pendente"),
  ]);
  return { activeCases: c1 ?? 0, pendingDocs: c2 ?? 0 };
}

export async function casesByStatus() {
  const { data, error } = await supabase.from("cases").select("status");
  if (error) throw error;
  const map = new Map<string, number>();
  (data ?? []).forEach((r: any) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
  return Array.from(map, ([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
}

export async function getOtherPartyId(userId: string, role: "advogado" | "cliente"): Promise<string | null> {
  const target = role === "cliente" ? "advogado" : "cliente";
  const { data } = await supabase.from("user_roles").select("user_id").eq("role", target).limit(1).maybeSingle();
  return (data as any)?.user_id ?? null;
}
