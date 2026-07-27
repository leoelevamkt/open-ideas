import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun; hint: string }[] = [
  { value: "claro", label: "Claro", icon: Sun, hint: "Padrão" },
  { value: "escuro", label: "Escuro", icon: Moon, hint: "Ideal para baixa visão / ambientes escuros" },
  { value: "sepia", label: "Sépia", icon: Contrast, hint: "Fundo bege suave, reduz cansaço visual" },
];

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<Theme>("claro");
  useEffect(() => { setCurrent(getTheme()); }, []);

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(o => {
        const Icon = o.icon;
        const active = current === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => { setTheme(o.value); setCurrent(o.value); }}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition",
              active ? "border-gold bg-gold/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-gold/50",
            )}
            aria-pressed={active}
          >
            <Icon className="size-5" />
            <span className="font-medium">{o.label}</span>
            <span className="text-[10px] leading-tight opacity-70">{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
