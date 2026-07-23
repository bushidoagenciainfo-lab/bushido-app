// WhatsApp: (1) alerta a Bushido cuando entra un lead (CallMeBot, gratis) y
// (2) mensaje al CLIENTE con el link de su informe (API oficial de Meta).
// Todo env-gated: si no está configurado, se omite sin romper nada.

// ── (1) Alerta a Bushido (a TU propio número) vía CallMeBot ──
// Setup: agrega +34 621 33 33 11 a tus contactos y mándale "I allow callmebot
// to send me messages" por WhatsApp; te devuelve tu apikey. Gratis.
const ALERT_PHONE = process.env.WHATSAPP_ALERT_PHONE; // tu número con código país, ej 573008923390
const ALERT_APIKEY = process.env.WHATSAPP_ALERT_APIKEY;

export function hasWhatsAppAlert(): boolean {
  return Boolean(ALERT_PHONE && ALERT_APIKEY);
}

export async function alertaBushidoWhatsApp(texto: string): Promise<void> {
  if (!ALERT_PHONE || !ALERT_APIKEY) return;
  try {
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(ALERT_PHONE)}` +
      `&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(ALERT_APIKEY)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) console.error("[wa:alerta] CallMeBot respondió", res.status);
  } catch (e) {
    console.error("[wa:alerta] error:", e);
  }
}

// ── (2) Mensaje al CLIENTE vía WhatsApp Business API (Meta Cloud API) ──
// Requiere: WhatsApp Business API configurado + una PLANTILLA aprobada.
const WA_TOKEN = process.env.WHATSAPP_TOKEN; // token permanente de la app de Meta
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID; // id del número emisor
const WA_TEMPLATE = process.env.WHATSAPP_TEMPLATE; // nombre de la plantilla aprobada
const WA_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es";

export function hasClientWhatsApp(): boolean {
  return Boolean(WA_TOKEN && WA_PHONE_ID && WA_TEMPLATE);
}

/** Normaliza a dígitos con código país (Colombia 57 por defecto). */
export function toWhatsAppNumber(phone?: string): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (!d.startsWith("57") && d.length <= 10) d = "57" + d; // asume Colombia
  return d;
}

/**
 * Envía al cliente un mensaje de plantilla. `params` rellena {{1}}, {{2}}, {{3}}…
 * en el orden de la plantilla (ej: nombre, marca, link del informe).
 */
export async function sendClientWhatsApp(opts: {
  phone?: string;
  params: string[];
}): Promise<void> {
  if (!hasClientWhatsApp()) return;
  const to = toWhatsAppNumber(opts.phone);
  if (!to) return;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: { authorization: `Bearer ${WA_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: WA_TEMPLATE,
          language: { code: WA_LANG },
          components: [
            { type: "body", parameters: opts.params.map((t) => ({ type: "text", text: t })) },
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.error("[wa:cliente] Meta rechazó:", JSON.stringify(data));
    else console.log("[wa:cliente] enviado a", to);
  } catch (e) {
    console.error("[wa:cliente] error:", e);
  }
}
