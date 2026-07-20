import { useEffect, useRef, useState } from "react";
import { PromoBanner } from "@/components/promo-banner";
import type { BannerData } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BannerCarousel({ banners, interval = 5000 }: { banners: BannerData[]; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      if (paused.current) return;
      const el = ref.current; if (!el) return;
      const next = (active + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, interval);
    return () => clearInterval(t);
  }, [active, banners.length, interval]);

  if (banners.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5"
      onPointerDown={() => (paused.current = true)}
      onPointerUp={() => (paused.current = false)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}>
      <div ref={ref} onScroll={() => {
        const el = ref.current; if (!el) return;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== active) setActive(i);
      }} className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden">
        {banners.map((b, i) => (
          <div key={b.id} className="w-full shrink-0 snap-center px-0.5">
            <PromoBanner banner={b} />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {banners.map((b, i) => (
            <button key={b.id} type="button" onClick={() => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: "smooth" })}
              className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-gold-strong" : "w-1.5 bg-muted-foreground/30")}
              aria-label={`Banner ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
