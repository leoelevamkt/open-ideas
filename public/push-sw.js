// Service worker dedicado a notificações push.
// Você pode usar este arquivo como está ou mesclar estes handlers
// no service worker do seu PWA (quando criá-lo).

self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: "Nova notificação", body: event.data ? event.data.text() : "" }
  }

  const title = data.title || "Guimarães & Guedes Advocacia"
  const options = {
    body: data.body || "",
    tag: data.tag || undefined,
    data: { url: data.url || "/notificacoes" },
    // Ícones opcionais — o PWA que você criar pode fornecê-los.
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [80, 40, 80],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || "/notificacoes"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma janela aberta, foca nela e navega.
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus()
          if ("navigate" in client) client.navigate(targetUrl)
          return
        }
      }
      // Caso contrário, abre uma nova janela.
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    }),
  )
})
