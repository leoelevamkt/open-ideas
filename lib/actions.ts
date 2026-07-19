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
    hearing_date: String(formData.get("hearing_date") ?? ""),
    hearing_time: String(formData.get("hearing_time") ?? ""),
    type: String(formData.get("type") ?? "Presencial"),
    location: String(formData.get("location") ?? ""),
    link: String(formData.get("link") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
  if (!f.title || !f.hearing_date) return { error: "Título e data são obrigatórios." }
  if (id) {
    await query(
      `UPDATE hearings SET title=$1, case_id=$2, hearing_date=$3, hearing_time=$4, type=$5, location=$6, link=$7, notes=$8 WHERE id=$9`,
      [f.title, f.case_id, f.hearing_date, f.hearing_time, f.type, f.location, f.link, f.notes, id],
    )
  } else {
    await query(
      `INSERT INTO hearings (title, case_id, hearing_date, hearing_time, type, location, link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [f.title, f.case_id, f.hearing_date, f.hearing_time, f.type, f.location, f.link, f.notes],
    )

    if (f.case_id) {
      const c = await queryOne<{ client_id: number | null }>("SELECT client_id FROM cases WHERE id=$1", [
        f.case_id,
      ])
      if (c?.client_id) {
        const cu = await queryOne<{ user_id: number | null }>("SELECT user_id FROM clients WHERE id=$1", [
          c.client_id,
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
