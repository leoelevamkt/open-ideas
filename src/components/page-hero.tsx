import { BrandLogo } from "@/components/brand-logo";

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="gold-topline relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm ring-1 ring-gold/15">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo variant="plate" className="h-11 w-fit px-3 py-1.5" />
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-strong ring-1 ring-gold/30">Advocacia</span>
        </div>
        <div>
          <span className="mb-2 block h-0.5 w-10 rounded-full bg-gold" />
          <h1 className="font-heading text-2xl font-semibold leading-snug tracking-refined">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-sidebar-foreground/70">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
