import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("gg_splash_shown")) {
      setVisible(false);
      onDone?.();
      return;
    }
    const t1 = setTimeout(() => setLeaving(true), 1600);
    const t2 = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("gg_splash_shown", "1"); } catch {}
      onDone?.();
    }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (!visible) return null;

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
            <img src="/logo-guimaraes-guedes.png" alt="Guimarães & Guedes Advocacia" className="h-24 w-auto object-contain" />
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
  );
}
