"use client"

import { useEffect, useRef, useState } from "react"
import { PromoBanner, type BannerData } from "@/components/promo-banner"
import { cn } from "@/lib/utils"

/**
 * Carrossel de banners no estilo app: rolagem horizontal por "snap",
 * avanço automático e indicadores (dots). O swipe nativo é tratado pelo
 * scroll-snap do container.
 */
export function BannerCarousel({
  banners,
  interval = 5000,
}: {
  banners: BannerData[]
  interval?: number
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)

  // Avanço automático
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      if (pausedRef.current) return
      const el = scrollerRef.current
      if (!el) return
      const next = (active + 1) % banners.length
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" })
    }, interval)
    return () => clearInterval(timer)
  }, [active, banners.length, interval])

  function onScroll() {
    const el = scrollerRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== active) setActive(index)
  }

  function goTo(index: number) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" })
  }

  if (banners.length === 0) return null

  return (
    <div
      className="flex flex-col gap-2.5"
      onPointerDown={() => (pausedRef.current = true)}
      onPointerUp={() => (pausedRef.current = false)}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="snap-x-app flex w-full overflow-x-auto"
      >
        {banners.map((banner, i) => (
          <div key={banner.id} className="snap-item w-full shrink-0 px-0.5">
            <PromoBanner banner={banner} priority={i === 0} />
          </div>
        ))}
      </div>

      {banners.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Banners">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ir para o banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-gold-strong" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
