import "server-only"
import webpush from "web-push"
import { query } from "@/lib/db"

let configured = false

function ensureConfigured() {
  if (configured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    return false
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contato@guimaraesguedes.adv.br", publicKey, privateKey)
  configured = true
  return true
}

type PushSubscriptionRow = {
  id: number
  endpoint: string
  p256dh: string
  auth: string
}

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Envia uma notificação push para todos os dispositivos registrados de um usuário.
 * Assinaturas expiradas/inválidas (410/404) são removidas do banco.
 */
export async function sendPushToUser(userId: number, payload: PushPayload) {
  if (!ensureConfigured()) return

  const subs = await query<PushSubscriptionRow>(
    "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1",
    [userId],
  )
  if (subs.length === 0) return

  const data = JSON.stringify(payload)

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data,
        )
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Assinatura expirada — remove
          await query("DELETE FROM push_subscriptions WHERE id = $1", [sub.id])
        } else {
          console.log("[v0] Falha ao enviar push:", statusCode ?? err)
        }
      }
    }),
  )
}

/**
 * Cria uma notificação no banco E dispara o push correspondente.
 * Centraliza os dois efeitos para manter o histórico e o aviso em tempo real sincronizados.
 */
export async function notifyUser(
  userId: number,
  opts: { title: string; description: string; type: string; url?: string },
) {
  await query("INSERT INTO notifications (user_id, title, description, type) VALUES ($1, $2, $3, $4)", [
    userId,
    opts.title,
    opts.description,
    opts.type,
  ])
  await sendPushToUser(userId, {
    title: opts.title,
    body: opts.description,
    url: opts.url ?? "/notificacoes",
    tag: opts.type,
  })
}
