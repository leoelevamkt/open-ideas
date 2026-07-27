/**
 * PWA service worker registration.
 * Guarded so it never runs in Lovable preview, dev, iframes, or when ?sw=off.
 */
export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const isPreviewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const killSwitch = url.searchParams.get("sw") === "off";

  const shouldSkip = !import.meta.env.PROD || inIframe || isPreviewHost || killSwitch;

  if (shouldSkip) {
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      for (const reg of regs) {
        const scriptURL = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
        if (scriptURL.endsWith("/sw.js")) reg.unregister().catch(() => {});
      }
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
