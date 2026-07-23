// Helper de cliente para registrar interés. Fire-and-forget (sendBeacon).
// Uso: track("cta", "analisis") · track("servicio", nombre) · etc.

export function track(
  type: string,
  name?: string,
  meta?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      type,
      name,
      path: window.location.pathname,
      ref: document.referrer || undefined,
      meta,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* la analítica nunca debe romper nada */
  }
}
