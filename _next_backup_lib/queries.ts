import { query, queryOne } from "@/lib/db"
import type {
  BankInfo,
  Case,
  Client,
  DocumentItem,
  Hearing,
  Invoice,
  Message,
  Notification,
  TimelineEvent,
  User,
} from "@/lib/types"

const num = (v: unknown): number => Number(v ?? 0)
const today = () => new Date().toISOString().slice(0, 10)

// ---------- Clientes ----------
export async function listClients(status?: "ativo" | "arquivado"): Promise<Client[]> {
  if (status) {
    return query<Client>("SELECT * FROM clients WHERE status = $1 ORDER BY full_name", [status])
  }
  return query<Client>("SELECT * FROM clients ORDER BY full_name")
}

export async function getClient(id: number): Promise<Client | null> {
  return queryOne<Client>("SELECT * FROM clients WHERE id = $1", [id])
}

export async function getClientByUserId(userId: number): Promise<Client | null> {
  return queryOne<Client>("SELECT * FROM clients WHERE user_id = $1", [userId])
}

// ---------- Processos ----------
export async function listCases(clientId?: number): Promise<Case[]> {
  if (clientId) {
    return query<Case>("SELECT * FROM cases WHERE client_id = $1 ORDER BY updated_at DESC", [clientId])
  }
  return query<Case>("SELECT * FROM cases ORDER BY updated_at DESC")
}

export async function listCasesWithClient(): Promise<Array<Case & { client_name: string | null }>> {
  return query<Case & { client_name: string | null }>(
    `SELECT c.*, cl.full_name as client_name FROM cases c
     LEFT JOIN clients cl ON cl.id = c.client_id ORDER BY c.updated_at DESC`,
  )
}

export async function getCase(id: number): Promise<Case | null> {
  return queryOne<Case>("SELECT * FROM cases WHERE id = $1", [id])
}

export async function listTimeline(caseId: number): Promise<TimelineEvent[]> {
  return query<TimelineEvent>(
    "SELECT * FROM timeline_events WHERE case_id = $1 ORDER BY event_date DESC, id DESC",
    [caseId],
  )
}

// ---------- Audiências ----------
export async function listHearings(
  clientId?: number,
): Promise<Array<Hearing & { case_title: string | null; client_name: string | null }>> {
  // Cliente associado diretamente à audiência tem prioridade; senão, usa o cliente do processo.
  const base = `
    SELECT h.*,
           c.title as case_title,
           COALESCE(h.client_id, c.client_id) as client_id,
           cl.full_name as client_name
    FROM hearings h
    LEFT JOIN cases c ON c.id = h.case_id
    LEFT JOIN clients cl ON cl.id = COALESCE(h.client_id, c.client_id)`
  if (clientId) {
    return query<Hearing & { case_title: string | null; client_name: string | null }>(
      `${base} WHERE COALESCE(h.client_id, c.client_id) = $1 ORDER BY h.hearing_date, h.hearing_time`,
      [clientId],
    )
  }
  return query<Hearing & { case_title: string | null; client_name: string | null }>(
    `${base} ORDER BY h.hearing_date, h.hearing_time`,
  )
}

export async function getNextHearing(
  clientId?: number,
): Promise<(Hearing & { case_title: string | null; client_name: string | null }) | null> {
  const base = `
    SELECT h.*,
           c.title as case_title,
           COALESCE(h.client_id, c.client_id) as client_id,
           cl.full_name as client_name
    FROM hearings h
    LEFT JOIN cases c ON c.id = h.case_id
    LEFT JOIN clients cl ON cl.id = COALESCE(h.client_id, c.client_id)
    WHERE h.hearing_date >= $1`
  if (clientId) {
    return queryOne<Hearing & { case_title: string | null; client_name: string | null }>(
      `${base} AND COALESCE(h.client_id, c.client_id) = $2 ORDER BY h.hearing_date, h.hearing_time LIMIT 1`,
      [today(), clientId],
    )
  }
  return queryOne<Hearing & { case_title: string | null; client_name: string | null }>(
    `${base} ORDER BY h.hearing_date, h.hearing_time LIMIT 1`,
    [today()],
  )
}

// ---------- Documentos ----------
export async function listDocuments(opts?: {
  clientId?: number
  caseId?: number
}): Promise<Array<DocumentItem & { uploader_name: string | null; client_name: string | null }>> {
  let sql = `
    SELECT d.*, u.name as uploader_name, cl.full_name as client_name
    FROM documents d
    LEFT JOIN users u ON u.id = d.uploaded_by
    LEFT JOIN clients cl ON cl.id = d.client_id`
  const where: string[] = []
  const params: Array<string | number | null> = []
  if (opts?.clientId) {
    params.push(opts.clientId)
    where.push(`d.client_id = $${params.length}`)
  }
  if (opts?.caseId) {
    params.push(opts.caseId)
    where.push(`d.case_id = $${params.length}`)
  }
  if (where.length) sql += " WHERE " + where.join(" AND ")
  sql += " ORDER BY d.created_at DESC"
  return query<DocumentItem & { uploader_name: string | null; client_name: string | null }>(sql, params)
}

// ---------- Mensagens ----------
export async function listMessages(userA: number, userB: number): Promise<Message[]> {
  return query<Message>(
    `SELECT * FROM messages
     WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $3 AND recipient_id = $4)
     ORDER BY created_at`,
    [userA, userB, userB, userA],
  )
}

export async function markMessagesRead(userId: number, otherUserId: number): Promise<void> {
  await query("UPDATE messages SET read=1 WHERE recipient_id=$1 AND sender_id=$2", [userId, otherUserId])
}

export async function getUserById(id: number): Promise<User | null> {
  return queryOne<User>("SELECT id, name, email, role, avatar_label FROM users WHERE id = $1", [id])
}

export async function listConversations(
  userId: number,
): Promise<Array<User & { unread: number; last_body: string | null }>> {
  const rows = await query<User & { unread: number | string; last_body: string | null }>(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_label,
        (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.recipient_id = $1 AND m.read = 0) as unread,
        (SELECT body FROM messages m WHERE (m.sender_id = u.id AND m.recipient_id = $2) OR (m.sender_id = $3 AND m.recipient_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as last_body
     FROM users u
     WHERE u.id != $4 AND u.role != (SELECT role FROM users WHERE id = $5)
     ORDER BY u.name`,
    [userId, userId, userId, userId, userId],
  )
  return rows.map((r) => ({ ...r, unread: num(r.unread) }))
}

// ---------- Notificações ----------
export async function listNotifications(userId: number): Promise<Notification[]> {
  return query<Notification>(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  )
}

export async function countUnreadNotifications(userId: number): Promise<number> {
  const r = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) as c FROM notifications WHERE user_id = $1 AND read = 0",
    [userId],
  )
  return num(r?.c)
}

export async function countUnreadMessages(userId: number): Promise<number> {
  const r = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) as c FROM messages WHERE recipient_id = $1 AND read = 0",
    [userId],
  )
  return num(r?.c)
}

// ---------- Dashboard (Advogado) ----------
export async function lawyerStats() {
  const clientsRow = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) c FROM clients WHERE status='ativo'",
  )
  const casesRow = await queryOne<{ c: number | string }>("SELECT COUNT(*) c FROM cases")
  const start = today()
  const weekEnd = new Date()
  weekEnd.setDate(new Date().getDate() + 7)
  const hearingsRow = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) c FROM hearings WHERE hearing_date BETWEEN $1 AND $2",
    [start, weekEnd.toISOString().slice(0, 10)],
  )
  const pendingRow = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) c FROM documents WHERE status='pendente'",
  )
  return {
    clients: num(clientsRow?.c),
    cases: num(casesRow?.c),
    hearingsWeek: num(hearingsRow?.c),
    pendingDocs: num(pendingRow?.c),
  }
}

// ---------- Dashboard (Cliente) ----------
export async function clientStats(clientId: number) {
  const activeRow = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) c FROM cases WHERE client_id = $1 AND status NOT IN ('Arquivado','Finalizado')",
    [clientId],
  )
  const pendingRow = await queryOne<{ c: number | string }>(
    "SELECT COUNT(*) c FROM documents WHERE client_id = $1 AND status='pendente'",
    [clientId],
  )
  return { activeCases: num(activeRow?.c), pendingDocs: num(pendingRow?.c) }
}

// ---------- Agenda/Prazos ----------
export async function getUpcomingHearings(): Promise<
  Array<Hearing & { case: Case & { client: Client } }>
> {
  const rows = await query<any>(
    `SELECT h.*, c.id as case_id, c.number, c.title,
            COALESCE(h.client_id, c.client_id) as client_id,
            cl.id as client_id_2, cl.full_name as client_name, cl.email, cl.phone, cl.cpf, cl.rg, cl.birth_date, cl.address, cl.status, cl.user_id, cl.whatsapp, cl.notes, cl.created_at
     FROM hearings h
     LEFT JOIN cases c ON c.id = h.case_id
     LEFT JOIN clients cl ON cl.id = COALESCE(h.client_id, c.client_id)
     WHERE h.hearing_date >= $1
     ORDER BY h.hearing_date ASC`,
    [today()],
  )

  return rows.map((h: any) => ({
    ...h,
    case: {
      id: h.case_id,
      number: h.number,
      title: h.title,
      client_id: h.client_id,
      client: {
        id: h.client_id_2,
        user_id: h.user_id,
        full_name: h.client_name,
        email: h.email,
        phone: h.phone,
        cpf: h.cpf,
        rg: h.rg,
        birth_date: h.birth_date,
        address: h.address,
        status: h.status,
        whatsapp: h.whatsapp,
        notes: h.notes,
        created_at: h.created_at,
      },
    },
  }))
}

export async function getClientHearings(
  clientId: number,
  status?: string,
): Promise<Array<Hearing & { case: { number: string; title: string } }>> {
  const base = `
    SELECT h.*, c.number as case_number, c.title as case_title
    FROM hearings h
    LEFT JOIN cases c ON c.id = h.case_id
    WHERE COALESCE(h.client_id, c.client_id) = $1`
  const rows =
    status === "proximashearing"
      ? await query<any>(`${base} AND h.hearing_date >= $2 ORDER BY h.hearing_date ASC`, [clientId, today()])
      : await query<any>(`${base} ORDER BY h.hearing_date DESC`, [clientId])

  return rows.map((h: any) => ({
    ...h,
    case: { number: h.case_number, title: h.case_title },
  }))
}

export async function lastMovement(
  clientId?: number,
): Promise<(TimelineEvent & { case_title: string | null }) | null> {
  if (clientId) {
    return queryOne<TimelineEvent & { case_title: string | null }>(
      `SELECT t.*, c.title as case_title FROM timeline_events t
       JOIN cases c ON c.id = t.case_id WHERE c.client_id = $1
       ORDER BY t.event_date DESC, t.id DESC LIMIT 1`,
      [clientId],
    )
  }
  return queryOne<TimelineEvent & { case_title: string | null }>(
    `SELECT t.*, c.title as case_title FROM timeline_events t
     JOIN cases c ON c.id = t.case_id ORDER BY t.event_date DESC, t.id DESC LIMIT 1`,
  )
}

export async function recentMovements(
  limit = 5,
): Promise<Array<TimelineEvent & { case_title: string | null }>> {
  return query<TimelineEvent & { case_title: string | null }>(
    `SELECT t.*, c.title as case_title FROM timeline_events t
     JOIN cases c ON c.id = t.case_id ORDER BY t.event_date DESC, t.id DESC LIMIT $1`,
    [limit],
  )
}

// ---------- Relatórios ----------
export async function casesByStatus(): Promise<Array<{ status: string; count: number }>> {
  const rows = await query<{ status: string; count: number | string }>(
    "SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY count DESC",
  )
  return rows.map((r) => ({ status: r.status, count: num(r.count) }))
}

export async function hearingsThisMonth(): Promise<Array<Hearing & { case_title: string | null }>> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return query<Hearing & { case_title: string | null }>(
    `SELECT h.*, c.title as case_title FROM hearings h LEFT JOIN cases c ON c.id = h.case_id
     WHERE h.hearing_date BETWEEN $1 AND $2 ORDER BY h.hearing_date`,
    [start, end],
  )
}

// ---------- Financeiro ----------
export async function getBankInfo(): Promise<BankInfo | null> {
  return queryOne<BankInfo>("SELECT * FROM bank_info WHERE id = 1")
}

export async function listInvoices(
  clientId?: number,
): Promise<Array<Invoice & { client_name: string | null; case_title: string | null }>> {
  const base = `
    SELECT i.*, cl.full_name as client_name, c.title as case_title
    FROM invoices i
    LEFT JOIN clients cl ON cl.id = i.client_id
    LEFT JOIN cases c ON c.id = i.case_id`
  if (clientId) {
    return query<Invoice & { client_name: string | null; case_title: string | null }>(
      `${base} WHERE i.client_id = $1 ORDER BY i.due_date DESC, i.id DESC`,
      [clientId],
    )
  }
  return query<Invoice & { client_name: string | null; case_title: string | null }>(
    `${base} ORDER BY i.due_date DESC, i.id DESC`,
  )
}

export async function getInvoice(id: number): Promise<Invoice | null> {
  return queryOne<Invoice>("SELECT * FROM invoices WHERE id = $1", [id])
}

export async function financeStats(clientId?: number) {
  const scope = clientId ? "WHERE client_id = $1 AND" : "WHERE"
  const params = clientId ? [clientId] : []
  const pending = await queryOne<{ c: number | string; total: number | string }>(
    `SELECT COUNT(*) c, COALESCE(SUM(amount),0) total FROM invoices ${scope} status = 'pendente'`,
    params,
  )
  const paid = await queryOne<{ total: number | string }>(
    `SELECT COALESCE(SUM(amount),0) total FROM invoices ${scope} status = 'pago'`,
    params,
  )
  return {
    pendingCount: num(pending?.c),
    pendingTotal: num(pending?.total),
    paidTotal: num(paid?.total),
  }
}

export async function getOtherPartyId(userId: number): Promise<number | null> {
  // Para o cliente, retorna o advogado; para o advogado, retorna o primeiro cliente
  const me = await queryOne<{ role: string }>("SELECT role FROM users WHERE id = $1", [userId])
  if (!me) return null
  const target = me.role === "cliente" ? "advogado" : "cliente"
  const other = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE role = $1 ORDER BY id LIMIT 1",
    [target],
  )
  return other?.id ?? null
}
