"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Tela de abertura (splash / preloader) exibida ao iniciar o app.
 * Mostra a logo do escritório sobre fundo escuro da marca, com uma
 * animação de entrada e uma barra de carregamento, saindo com um fade.
 * É exibida uma vez por sessão para não incomodar em recarregamentos.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("gg_splash_shown")) {
      setVisible(false)
      return
    }

    const startLeave = setTimeout(() => setLeaving(true), 1800)
    const remove = setTimeout(() => {
      setVisible(false)
      try {
        sessionStorage.setItem("gg_splash_shown", "1")
      } catch {
        /* ignore */
      }
    }, 2400)

    return () => {
      clearTimeout(startLeave)
      clearTimeout(remove)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-label="Carregando aplicativo"
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141210] transition-opacity duration-500",
        leaving ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-8 px-8">
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center justify-center rounded-2xl bg-white px-6 py-5 shadow-2xl">
            <Image
              src="/logo-guimaraes-guedes.png"
              alt="Guimarães & Guedes Advocacia"
              width={520}
              height={244}
              priority
              className="h-24 w-auto object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-1000">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
            <div className="gg-splash-loading h-full rounded-full bg-[oklch(0.7_0.1_80)]" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Advocacia</p>
        </div>
      </div>
    </div>
  )
}
