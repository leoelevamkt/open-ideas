import Image from "next/image"
import { BrandLogo } from "@/components/brand-logo"

/**
 * Cabeçalho de página com identidade da marca: fundo escuro do escritório,
 * logo em destaque e uma marca d'água sutil do símbolo. Reforça a presença
 * visual da Guimarães & Guedes em todas as telas.
 */
export function PageHero({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="gold-topline relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm ring-1 ring-gold/15">
      {/* Brilho dourado ambiente */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
      />
      {/* Marca d'água do símbolo */}
      <Image
        src="/brand-mark.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 opacity-20 mix-blend-luminosity"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo variant="plate" className="h-11 w-fit px-3 py-1.5" />
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-strong ring-1 ring-gold/30">
            Advocacia
          </span>
        </div>
        <div>
          <span className="mb-2 block h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
          <h1 className="text-balance font-heading text-2xl font-semibold leading-snug tracking-refined">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-sidebar-foreground/70">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
