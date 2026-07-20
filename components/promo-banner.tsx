import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type BannerData = {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  image: string
  href?: string
  cta?: string
}

/**
 * Banner promocional/informativo com a identidade da marca (preto + dourado).
 * Imagem de fundo com sobreposição escura à esquerda para legibilidade do texto.
 * Usado individualmente ou dentro do BannerCarousel.
 */
export function PromoBanner({
  banner,
  className,
  priority,
}: {
  banner: BannerData
  className?: string
  priority?: boolean
}) {
  const content = (
    <div
      className={cn(
        "gold-topline group relative flex h-44 w-full overflow-hidden rounded-2xl ring-1 ring-gold/20",
        className,
      )}
    >
      <Image
        src={banner.image}
        alt=""
        aria-hidden="true"
        fill
        sizes="480px"
        priority={priority}
        className="object-cover"
      />
      <div className="banner-scrim absolute inset-0" />

      <div className="relative flex flex-1 flex-col justify-center gap-1.5 p-5">
        {banner.eyebrow ? (
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-5 bg-gold" aria-hidden="true" />
            {banner.eyebrow}
          </span>
        ) : null}
        <h3 className="max-w-[80%] text-balance font-heading text-xl font-semibold leading-tight tracking-refined text-white">
          {banner.title}
        </h3>
        {banner.subtitle ? (
          <p className="max-w-[78%] text-pretty text-xs leading-relaxed text-white/70">
            {banner.subtitle}
          </p>
        ) : null}
        {banner.href && banner.cta ? (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-primary transition-transform group-active:scale-95">
            {banner.cta}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </div>
  )

  if (banner.href) {
    return (
      <Link href={banner.href} aria-label={banner.title} className="block">
        {content}
      </Link>
    )
  }
  return content
}
