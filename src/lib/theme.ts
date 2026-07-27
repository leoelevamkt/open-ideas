// Tema visual do app: claro (padrão), escuro (fundo preto) e sépia (fundo bege suave).
// Persiste em localStorage e aplica classe no <html> antes do primeiro paint.

export type Theme = "claro" | "escuro" | "sepia";
const KEY = "gg-theme";
const VALID: Theme[] = ["claro", "escuro", "sepia"];

export function getTheme(): Theme {
  if (typeof window === "undefined") return "claro";
  const v = window.localStorage.getItem(KEY) as Theme | null;
  return v && VALID.includes(v) ? v : "claro";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "theme-sepia");
  if (t === "escuro") root.classList.add("dark");
  else if (t === "sepia") root.classList.add("theme-sepia");
}

export function setTheme(t: Theme) {
  try { window.localStorage.setItem(KEY, t); } catch {}
  applyTheme(t);
  window.dispatchEvent(new CustomEvent("gg-theme-change", { detail: t }));
}

export function initTheme() { applyTheme(getTheme()); }
