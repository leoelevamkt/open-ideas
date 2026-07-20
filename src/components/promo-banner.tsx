import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { BannerData } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PromoBanner({ banner, className }: { banner: BannerData; className?: string }) {
  const content = (
    <div className={cn("gold-topline group relative flex h-44 w-full overflow-hidden rounded-2xl ring-1 ring-gold/20", className)}>
      <img src={banner.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="banner-scrim absolute inset-0" />
      <div className="relative flex flex-1 flex-col justify-center gap-1.5 p-5">
        {banner.eyebrow && (
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <span className="h-px w-5 bg-gold" /> {banner.eyebrow}
          </span>
        )}
        <h3 className="max-w-[80%] font-heading text-xl font-semibold leading-tight tracking-refined text-white">{banner.title}</h3>
        {banner.subtitle && <p className="max-w-[78%] text-xs leading-relaxed text-white/70">{banner.subtitle}</p>}
        {banner.href && banner.cta && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-primary">
            {banner.cta} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
  return banner.href ? <Link to={banner.href as any} className="block">{content}</Link> : content;
}
