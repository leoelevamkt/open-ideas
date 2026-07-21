import { supabase } from "@/integrations/supabase/client";
import type { Client, Case, DocumentItem, Message, Notification, TimelineEvent } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

/* ---------------- READS ---------------- */
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
    .from("cases").select("*, client:clients(full_name)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c: any) => ({ ...c, client_name: c.client?.full_name ?? null })) as Array<Case & { client_name: string | null }>;
}

export async function getCase(id: string) {
  const { data } = await supabase.from("cases").select("*, client:clients(full_name)").eq("id", id).maybeSingle();
  return data as (Case & { client?: { full_name: string } }) | null;
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

export async function getUpcomingHearings(limit = 5) {
  const { data, error } = await supabase
    .from("hearings")
    .select("*, case:cases(title, client:clients(full_name))")
    .gte("hearing_date", today()).order("hearing_date").limit(limit);
  if (error) throw error;
  return (data ?? []).map((h: any) => ({ ...h, case_title: h.case?.title ?? null }));
}

export async function listDocuments(opts?: { clientId?: string; caseId?: string }) {
  let q = supabase.from("documents").select("*, client:clients(full_name)").order("created_at", { ascending: false });
  if (opts?.clientId) q = q.eq("client_id", opts.clientId);
  if (opts?.caseId) q = q.eq("case_id", opts.caseId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, client_name: d.client?.full_name ?? null })) as Array<DocumentItem & { client_name: string | null }>;
}

export async function listMessagesBetween(a: string, b: string) {
  const { data, error } = await supabase.from("messages").select("*")
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

export async function listRecentTimeline(limit = 5) {
  const { data, error } = await supabase.from("timeline_events")
    .select("*, case:cases(title)").order("event_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((t: any) => ({ ...t, case_title: t.case?.title ?? null }));
}

export async function lawyerStats() {
  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
  const [c1, c2, c3, c4] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("hearings").select("*", { count: "exact", head: true }).gte("hearing_date", today()).lte("hearing_date", in7.toISOString().slice(0, 10)),
    supabase.from("invoices").select("amount").eq("status", "pendente"),
  ]);
  const pending = (c4.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  return { clients: c1.count ?? 0, cases: c2.count ?? 0, hearingsWeek: c3.count ?? 0, pendingAmount: pending };
}

export async function clientStats(clientId: string) {
  const [c1, c2] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("client_id", clientId).not("status", "in", "(Arquivado,Finalizado)"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "pendente"),
  ]);
  return { activeCases: c1.count ?? 0, pendingDocs: c2.count ?? 0 };
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

/* ---------------- FINANCE ---------------- */
export async function getBankInfo() {
  const { data } = await supabase.from("bank_info").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return data as any;
}
export async function upsertBankInfo(payload: any) {
  const existing = await getBankInfo();
  const row = { ...payload, updated_at: new Date().toISOString() };
  if (existing?.id) {
    const { error } = await supabase.from("bank_info").update(row).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("bank_info").insert(row);
    if (error) throw error;
  }
}

export async function listInvoices(clientId?: string) {
  let q = supabase.from("invoices").select("*, client:clients(full_name), case:cases(title)").order("due_date", { ascending: false });
  if (clientId) q = q.eq("client_id", clientId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((i: any) => ({ ...i, client_name: i.client?.full_name ?? null, case_title: i.case?.title ?? null }));
}

export async function financeStats() {
  const [pend, paid] = await Promise.all([
    supabase.from("invoices").select("amount, status").in("status", ["pendente"]),
    supabase.from("invoices").select("amount").eq("status", "pago"),
  ]);
  const pending = (pend.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  const received = (paid.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  return { pending, received, pendingCount: pend.data?.length ?? 0 };
}

/* ---------------- MUTATIONS ---------------- */
export async function saveClient(payload: any) {
  if (payload.id) {
    const { id, ...rest } = payload;
    const { error } = await supabase.from("clients").update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("clients").insert(payload);
    if (error) throw error;
  }
}
export async function archiveClient(id: string, current: "ativo" | "arquivado") {
  const next = current === "arquivado" ? "ativo" : "arquivado";
  const { error } = await supabase.from("clients").update({ status: next }).eq("id", id);
  if (error) throw error;
}

export async function saveCase(payload: any) {
  if (payload.id) {
    const { id, ...rest } = payload;
    const { error } = await supabase.from("cases").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cases").insert(payload);
    if (error) throw error;
  }
}

export async function saveHearing(payload: any) {
  if (payload.id) {
    const { id, ...rest } = payload;
    const { error } = await supabase.from("hearings").update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("hearings").insert(payload);
    if (error) throw error;
  }
}
export async function deleteHearing(id: string) {
  const { error } = await supabase.from("hearings").delete().eq("id", id);
  if (error) throw error;
}

export async function saveDocument(payload: any) {
  const { id, ...rest } = payload;
  if (id) {
    const { error } = await supabase.from("documents").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { data: s } = await supabase.auth.getSession();
  const row = { ...rest, uploaded_by: s.session?.user.id ?? null, status: rest.status ?? "disponivel" };
  const { error } = await supabase.from("documents").insert(row);
  if (error) throw error;
}
export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export async function saveInvoice(payload: any) {
  if (payload.id) {
    const { id, ...rest } = payload;
    const { error } = await supabase.from("invoices").update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { data: s } = await supabase.auth.getSession();
    const { error } = await supabase.from("invoices").insert({ ...payload, created_by: s.session?.user.id ?? null });
    if (error) throw error;
  }
}
export async function setInvoiceStatus(id: string, status: string) {
  const patch: any = { status };
  if (status === "pago") patch.paid_at = new Date().toISOString();
  else patch.paid_at = null;
  const { error } = await supabase.from("invoices").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

export async function addTimelineEvent(payload: any) {
  const { error } = await supabase.from("timeline_events").insert(payload);
  if (error) throw error;
}
