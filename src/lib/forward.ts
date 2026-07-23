// Webhook saliente: reenvía leads y eventos a TU servidor de monitoreo.
// Best-effort: nunca lanza (no debe romper el flujo del sitio si tu server falla).
// Se activa solo si DATA_WEBHOOK_URL está configurado.

const URL_ = process.env.DATA_WEBHOOK_URL;
const SECRET = process.env.DATA_WEBHOOK_SECRET;

export function hasWebhook(): boolean {
  return Boolean(URL_);
}

export async function forwardToServer(
  event: "lead" | "event" | "analisis",
  payload: Record<string, unknown>
): Promise<void> {
  if (!URL_) return;
  try {
    await fetch(URL_, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(SECRET ? { "x-bushido-secret": SECRET } : {}),
      },
      body: JSON.stringify({ source: "bushidoav.com", event, at: new Date().toISOString(), payload }),
      // no bloquear demasiado: si tu server tarda, seguimos
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error(`[forward:${event}] no se pudo enviar a tu servidor:`, err);
  }
}
