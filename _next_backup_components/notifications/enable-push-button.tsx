"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { savePushSubscriptionAction, removePushSubscriptionAction } from "@/lib/actions"

type Status = "checking" | "unsupported" | "denied" | "off" | "on" | "working"

const SW_URL = "/push-sw.js"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function EnablePushButton() {
  const [status, setStatus] = useState<Status>("checking")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    let active = true
    async function check() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (active) setStatus("unsupported")
        return
      }
      if (Notification.permission === "denied") {
        if (active) setStatus("denied")
        return
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration(SW_URL)
        const sub = reg ? await reg.pushManager.getSubscription() : null
        if (active) setStatus(sub ? "on" : "off")
      } catch {
        if (active) setStatus("off")
      }
    }
    check()
    return () => {
      active = false
    }
  }, [])

  async function enable() {
    setStatus("working")
    setMessage("")
    try {
      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapid) {
        setMessage("Chave VAPID não configurada.")
        setStatus("off")
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off")
        return
      }
      const reg = await navigator.serviceWorker.register(SW_URL)
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      })
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      const res = await savePushSubscriptionAction({
        endpoint: json.endpoint ?? "",
        keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
      })
      if (res?.error) {
        setMessage(res.error)
        setStatus("off")
        return
      }
      setStatus("on")
      setMessage("Notificações ativadas neste dispositivo.")
    } catch (err) {
      setMessage("Não foi possível ativar as notificações.")
      setStatus("off")
      console.log("[v0] Erro ao ativar push:", err)
    }
  }

  async function disable() {
    setStatus("working")
    setMessage("")
    try {
      const reg = await navigator.serviceWorker.getRegistration(SW_URL)
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) {
        await removePushSubscriptionAction(sub.endpoint)
        await sub.unsubscribe()
      }
      setStatus("off")
      setMessage("Notificações desativadas neste dispositivo.")
    } catch {
      setStatus("on")
      setMessage("Não foi possível desativar.")
    }
  }

  if (status === "checking") {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verificando…
      </Button>
    )
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-muted-foreground">
        Este navegador não suporta notificações push. Instale o app na tela inicial para ativá-las.
      </p>
    )
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-muted-foreground">
        Notificações bloqueadas. Habilite-as nas configurações do navegador para este site.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "on" ? (
        <Button variant="outline" size="sm" onClick={disable}>
          <BellRing className="mr-1 h-4 w-4 text-primary" /> Notificações ativas
        </Button>
      ) : status === "working" ? (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processando…
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={enable}>
          <Bell className="mr-1 h-4 w-4" /> Ativar notificações
        </Button>
      )}
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}
