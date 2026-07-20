"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { query, queryOne } from "@/lib/db"
import { authenticate, createSession, destroySession, getCurrentUser } from "@/lib/auth"
import { notifyUser } from "@/lib/push"

// ---------- Autenticação ----------
export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const user = await authenticate(email, password)
  if (!user) {
    return { error: "E-mail ou senha inválidos." }
  }
  await createSession(user.id)
  redirect("/dashboard")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

async function requireLawyer() {
  const user = await getCurrentUser()
  if (!user || user.role !== "advogado") {
    throw new Error("Não autorizado")
  }
  return user
}

// ---------- Clientes ----------
export async function saveClientAction(_prev: unknown, formData: FormData) {
  await requireLawyer()
  const id = formData.get("id") ? Number(formData.get("id")) : null
  const fields = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? ""),
    rg: String(formData.get("rg") ?? ""),
    birth_date: String(formData.get("birth_date") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
  if (!fields.full_name) return { error: "Nome é obrigatório." }

  if (id) {
    await query(
      `UPDATE clients SET full_name=$1, cpf=$2, rg=$3, birth_date=$4, phone=$5, whatsapp=$6, email=$7, address=$8, notes=$9 WHERE id=$10`,
      [
        fields.full_name,
        fields.cpf,
        fields.rg,
        fields.birth_date,
        fields.phone,
        fields.whatsapp,
        fields.email,
        fields.address,
        fields.notes,
        id,
      ],
    )
  } else {
    await query(
      `INSERT INTO clients (full_name, cpf, rg, birth_date, phone, whatsapp, email, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        fields.full_name,
        fields.cpf,
        fields.rg,
        fields.birth_date,
        fields.phone,
        fields.whatsapp,
        fields.email,
        fields.address,
        fields.notes,
      ],
    )
  }
  revalidatePath("/clientes")
  return { success: true }
}

export async function archiveClientAction(formData: FormData) {
  await requireLawyer()
  const id = Number(formData.get("id"))
  const current = await queryOne<{ status: string }>("SELECT status FROM clients WHERE id=$1", [id])
  const next = current?.status === "arquivado" ? "ativo" : "arquivado"
  await query("UPDATE clients SET status=$1 WHERE id=$2", [next, id])
  revalidatePath("/clientes")
}

// ---------- Processos ----------
export async function saveCaseAction(_prev: unknown, formData: FormData) {
  await requireLawyer()
  const id = formData.get("id") ? Number(formData.get("id")) : null
  const f = {
    number: String(formData.get("number") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    action_type: String(formData.get("action_type") ?? ""),
    legal_area: String(formData.get("legal_area") ?? ""),
    court: String(formData.get("court") ?? ""),
    court_division: String(formData.get("court_division") ?? ""),
    district: String(formData.get("district") ?? ""),
    plaintiff: String(formData.get("plaintiff") ?? ""),
    defendant: String(formData.get("defendant") ?? ""),
    status: String(formData.get("status") ?? "Em Análise"),
    lawyer_name: String(formData.get("lawyer_name") ?? ""),
    description: String(formData.get("description") ?? ""),
    client_id: formData.get("client_id") ? Number(formData.get("client_id")) : null,
  }
  if (!f.title || !f.number) return { error: "Número e título são obrigatórios." }

  if (id) {
    await query(
      `UPDATE cases SET number=$1, title=$2, action_type=$3, legal_area=$4, court=$5, court_division=$6, district=$7,
       plaintiff=$8, defendant=$9, status=$10, lawyer_name=$11, description=$12, client_id=$13, updated_at=now()::text WHERE id=$14`,
      [
        f.number, f.title, f.action_type, f.legal_area, f.court, f.court_division, f.district,
        f.plaintiff, f.defendant, f.status, f.lawyer_name, f.description, f.client_id, id,
      ],
    )
  } else {
    await query(
      `INSERT INTO cases (number, title, action_type, legal_area, court, court_division, district,
       plaintiff, defendant, status, lawyer_name, description, client_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        f.number, f.title, f.action_type, f.legal_area, f.court, f.court_division, f.district,
        f.plaintiff, f.defendant, f.status, f.lawyer_name, f.description, f.client_id,
      ],
    )
  }
  revalidatePath("/processos")
  return { success: true }
}

export async function addTimelineEventAction(_prev: unknown, formData: FormData) {
  await requireLawyer()
  const caseId = Number(formData.get("case_id"))
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "")
  const eventDate = String(formData.get("event_date") ?? "") || new Date().toISOString().slice(0, 10)
  const responsible = String(formData.get("responsible") ?? "")
  if (!title) return { error: "Título do evento é obrigatório." }
  await query(
    "INSERT INTO timeline_events (case_id, title, description, event_date, responsible) VALUES ($1, $2, $3, $4, $5)",
    [caseId, title, description, eventDate, responsible],
  )
  await query("UPDATE cases SET updated_at=now()::text WHERE id=$1", [caseId])

  // Notificar o cliente vinculado
  const c = await queryOne<{ client_id: number | null }>("SELECT client_id FROM cases WHERE id=$1", [caseId])
  if (c?.client_id) {
    const cu = await queryOne<{ user_id: number | null }>("SELECT user_id FROM clients WHERE id=$1", [
      c.client_id,
    ])
    if (cu?.user_id) {
      await notifyUser(cu.user_id, {
        title: "Nova movimentação processual",
        description: title,
        type: "movimentacao",
        url: `/processos/${caseId}`,
      })
    }
  }
  revalidatePath(`/processos/${caseId}`)
  return { success: true }
}

// ---------- Audiências ----------
export async function saveHearingAction(_prev: unknown, formData: FormData) {
  await requireLawyer()
  const id = formData.get("id") ? Number(formData.get("id")) : null
  const f = {
    title: String(formData.get("title") ?? "").trim(),
    case_id: formData.get("case_id") ? Number(formData.get("case_id")) : null,
    client_id: formData.get("client_id") ? Number(formData.get("client_id")) : null,
    hearing_date: String(formData.get("hearing_date") ?? ""),
    hearing_time: String(formData.get("hearing_time") ?? ""),
    type: String(formData.get("type") ?? "Presencial"),
    location: String(formData.get("location") ?? ""),
    link: String(formData.get("link") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
  if (!f.title || !f.hearing_date) return { error: "Título e data são obrigatórios." }

  // Se nenhum cliente foi escolhido diretamente, herda o cliente do processo vinculado.
  let clientId = f.client_id
  if (!clientId && f.case_id) {
    const c = await queryOne<{ client_id: number | null }>("SELECT client_id FROM cases WHERE id=$1", [
      f.case_id,
    ])
    clientId = c?.client_id ?? null
  }

  if (id) {
    await query(
      `UPDATE hearings SET title=$1, case_id=$2, client_id=$3, hearing_date=$4, hearing_time=$5, type=$6, location=$7, link=$8, notes=$9 WHERE id=$10`,
      [f.title, f.case_id, clientId, f.hearing_date, f.hearing_time, f.type, f.location, f.link, f.notes, id],
    )
  } else {
    await query(
      `INSERT INTO hearings (title, case_id, client_id, hearing_date, hearing_time, type, location, link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [f.title, f.case_id, clientId, f.hearing_date, f.hearing_time, f.type, f.location, f.link, f.notes],
    )

    if (clientId) {
      const cu = await queryOne<{ user_id: number | null }>("SELECT user_id FROM clients WHERE id=$1", [
        clientId,
      ])
      if (cu?.user_id) {
        await notifyUser(cu.user_id, {
          title: "Nova audiência marcada",
          description: f.title,
          type: "audiencia",
          url: "/agenda-prazos",
        })
      }
    }
  }
  revalidatePath("/agenda")
  return { success: true }
}

export async function deleteHearingAction(formData: FormData) {
  await requireLawyer()
  await query("DELETE FROM hearings WHERE id=$1", [Number(formData.get("id"))])
  revalidatePath("/agenda")
}

// ---------- Documentos ----------
export async function saveDocumentAction(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Não autorizado" }
  const name = String(formData.get("name") ?? "").trim()
  const category = String(formData.get("category") ?? "Outros")
  const clientId = formData.get("client_id") ? Number(formData.get("client_id")) : null
  const caseId = formData.get("case_id") ? Number(formData.get("case_id")) : null
  if (!name) return { error: "Nome do documento é obrigatório." }
  await query(
    "INSERT INTO documents (name, category, uploaded_by, client_id, case_id, status, size_label) VALUES ($1, $2, $3, $4, $5, 'disponivel', $6)",
    [name, category, user.id, clientId, caseId, "—"],
  )
  revalidatePath("/documentos")
  return { success: true }
}

export async function deleteDocumentAction(formData: FormData) {
  await requireLawyer()
  await query("DELETE FROM documents WHERE id=$1", [Number(formData.get("id"))])
  revalidatePath("/documentos")
}

// ---------- Mensagens ----------
export async function sendMessageAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return
  const recipientId = Number(formData.get("recipient_id"))
  const body = String(formData.get("body") ?? "").trim()
  if (!body) return
  await query("INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3)", [
    user.id,
    recipientId,
    body,
  ])
  await notifyUser(recipientId, {
    title: "Nova mensagem recebida",
    description: `${user.name}: ${body.slice(0, 60)}`,
    type: "mensagem",
    url: `/mensagens?u=${user.id}`,
  })
  revalidatePath("/mensagens")
}

// ---------- Financeiro ----------
export async function saveBankInfoAction(_prev: unknown, formData: FormData) {
  await requireLawyer()
  const f = {
    bank_name: String(formData.get("bank_name") ?? ""),
    agency: String(formData.get("agency") ?? ""),
    account: String(formData.get("account") ?? ""),
    account_type: String(formData.get("account_type") ?? ""),
    holder: String(formData.get("holder") ?? ""),
    document: String(formData.get("document") ?? ""),
    pix_key: String(formData.get("pix_key") ?? ""),
    pix_type: String(formData.get("pix_type") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
  await query(
    `INSERT INTO bank_info (id, bank_name, agency, account, account_type, holder, document, pix_key, pix_type, notes, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (id) DO UPDATE SET
       bank_name=EXCLUDED.bank_name, agency=EXCLUDED.agency, account=EXCLUDED.account,
       account_type=EXCLUDED.account_type, holder=EXCLUDED.holder, document=EXCLUDED.document,
       pix_key=EXCLUDED.pix_key, pix_type=EXCLUDED.pix_type, notes=EXCLUDED.notes, updated_at=now()`,
    [
      f.bank_name, f.agency, f.account, f.account_type, f.holder,
      f.document, f.pix_key, f.pix_type, f.notes,
    ],
  )
  revalidatePath("/financeiro")
  return { success: true }
}

export async function saveInvoiceAction(_prev: unknown, formData: FormData) {
  const lawyer = await requireLawyer()
  const id = formData.get("id") ? Number(formData.get("id")) : null
  const f = {
    client_id: formData.get("client_id") ? Number(formData.get("client_id")) : null,
    case_id: formData.get("case_id") ? Number(formData.get("case_id")) : null,
    description: String(formData.get("description") ?? "").trim(),
    amount: Number(String(formData.get("amount") ?? "0").replace(",", ".")) || 0,
    due_date: String(formData.get("due_date") ?? ""),
    barcode: String(formData.get("barcode") ?? ""),
    payment_link: String(formData.get("payment_link") ?? ""),
    pix_copy_paste: String(formData.get("pix_copy_paste") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
  if (!f.client_id) return { error: "Selecione o cliente." }
  if (!f.description) return { error: "Descrição é obrigatória." }
  if (!f.due_date) return { error: "Informe a data de vencimento." }

  if (id) {
    await query(
      `UPDATE invoices SET client_id=$1, case_id=$2, description=$3, amount=$4, due_date=$5,
       barcode=$6, payment_link=$7, pix_copy_paste=$8, notes=$9 WHERE id=$10`,
      [
        f.client_id, f.case_id, f.description, f.amount, f.due_date,
        f.barcode, f.payment_link, f.pix_copy_paste, f.notes, id,
      ],
    )
  } else {
    await query(
      `INSERT INTO invoices (client_id, case_id, description, amount, due_date, barcode, payment_link, pix_copy_paste, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        f.client_id, f.case_id, f.description, f.amount, f.due_date,
        f.barcode, f.payment_link, f.pix_copy_paste, f.notes, lawyer.id,
      ],
    )
    // Avisar o cliente sobre o novo boleto
    const cu = await queryOne<{ user_id: number | null }>("SELECT user_id FROM clients WHERE id=$1", [
      f.client_id,
    ])
    if (cu?.user_id) {
      await notifyUser(cu.user_id, {
        title: "Novo boleto disponível",
        description: `${f.description} — vencimento em ${f.due_date.split("-").reverse().join("/")}`,
        type: "financeiro",
        url: "/financeiro",
      })
    }
  }
  revalidatePath("/financeiro")
  return { success: true }
}

export async function deleteInvoiceAction(formData: FormData) {
  await requireLawyer()
  await query("DELETE FROM invoices WHERE id=$1", [Number(formData.get("id"))])
  revalidatePath("/financeiro")
}

export async function setInvoiceStatusAction(formData: FormData) {
  await requireLawyer()
  const id = Number(formData.get("id"))
  const status = String(formData.get("status") ?? "pendente")
  const paidAt = status === "pago" ? "now()" : "NULL"
  await query(`UPDATE invoices SET status=$1, paid_at=${paidAt} WHERE id=$2`, [status, id])
  revalidatePath("/financeiro")
}

export async function markInvoicePaidAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return
  const id = Number(formData.get("id"))
  // O cliente só pode marcar como pago um boleto vinculado ao seu próprio cadastro.
  const inv = await queryOne<{ client_id: number; description: string }>(
    `SELECT i.id, i.client_id, i.description FROM invoices i
     JOIN clients cl ON cl.id = i.client_id
     WHERE i.id = $1 AND (cl.user_id = $2 OR $3 = 'advogado')`,
    [id, user.id, user.role],
  )
  if (!inv) return
  await query("UPDATE invoices SET status='pago', paid_at=now() WHERE id=$1", [id])

  // Avisar a advogada que o cliente informou o pagamento
  const lawyer = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE role='advogado' ORDER BY id LIMIT 1",
  )
  if (lawyer && user.role === "cliente") {
    await notifyUser(lawyer.id, {
      title: "Pagamento informado pelo cliente",
      description: `${user.name} marcou como pago: ${inv.description}`,
      type: "financeiro",
      url: "/financeiro",
    })
  }
  revalidatePath("/financeiro")
}

// ---------- Notificações ----------
export async function markNotificationReadAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return
  await query("UPDATE notifications SET read=1 WHERE id=$1 AND user_id=$2", [
    Number(formData.get("id")),
    user.id,
  ])
  revalidatePath("/notificacoes")
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser()
  if (!user) return
  await query("UPDATE notifications SET read=1 WHERE user_id=$1", [user.id])
  revalidatePath("/notificacoes")
}

// ---------- Push (notificações no celular) ----------
type PushSubscriptionInput = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function savePushSubscriptionAction(sub: PushSubscriptionInput) {
  const user = await getCurrentUser()
  if (!user) return { error: "Não autorizado" }
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return { error: "Assinatura inválida." }
  }
  // Upsert por endpoint: reassocia ao usuário atual e atualiza as chaves.
  await query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint)
     DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [user.id, sub.endpoint, sub.keys.p256dh, sub.keys.auth],
  )
  return { success: true }
}

export async function removePushSubscriptionAction(endpoint: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Não autorizado" }
  await query("DELETE FROM push_subscriptions WHERE endpoint=$1 AND user_id=$2", [endpoint, user.id])
  return { success: true }
}
