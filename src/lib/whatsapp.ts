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

/**
 * Normaliza a dígitos con código país (Colombia 57 por defecto).
 * Tolera lo que la gente escribe de verdad: "+57 300...", "300 892 3390",
 * y el caso del formulario donde el prefijo +57 queda duplicado ("5757300...").
 */
export function toWhatsAppNumber(phone?: string): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  // quita códigos de país repetidos: 57 57 300... → 57 300...
  while (d.startsWith("5757")) d = d.slice(2);
  // celular colombiano sin código: 10 dígitos empezando por 3
  if (d.length === 10 && d.startsWith("3")) d = "57" + d;
  // 57 + 10 dígitos = 12. Si quedó más largo y empieza por 57, recorta el sobrante
  if (d.startsWith("57") && d.length > 12) d = "57" + d.slice(-10);
  return d;
}

/**
 * Idiomas a intentar, en orden. Meta registra la plantilla bajo UN código exacto
 * ("es", "es_CO", "es_ES"…) y rechaza con 132001 si no coincide. En vez de
 * adivinar, probamos los candidatos: el configurado primero, luego los comunes.
 */
function langCandidates(): string[] {
  const set = [WA_LANG, "es", "es_CO", "es_ES", "es_MX"];
  return [...new Set(set.filter(Boolean))] as string[];
}

async function postTemplate(to: string, lang: string, params: string[]) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${WA_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: WA_TEMPLATE,
        language: { code: lang },
        components: [
          { type: "body", parameters: params.map((t) => ({ type: "text", text: t })) },
        ],
      },
    }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/**
 * Envía al cliente el mensaje de plantilla. `params` rellena {{1}}, {{2}}, {{3}}…
 * en el orden de la plantilla (nombre, marca, link del informe).
 * Si el idioma configurado no coincide con el que Meta registró, reintenta con
 * los otros candidatos y avisa en el log cuál sí funcionó.
 */
export async function sendClientWhatsApp(opts: {
  phone?: string;
  params: string[];
}): Promise<{ ok: boolean; to?: string; lang?: string; error?: unknown }> {
  if (!hasClientWhatsApp()) {
    console.warn("[wa:cliente] sin configurar (falta WHATSAPP_TOKEN/PHONE_ID/TEMPLATE)");
    return { ok: false, error: "sin configurar" };
  }
  const to = toWhatsAppNumber(opts.phone);
  if (!to) {
    console.warn(`[wa:cliente] teléfono inválido: "${opts.phone}"`);
    return { ok: false, error: "teléfono inválido" };
  }
  try {
    let last: unknown = null;
    for (const lang of langCandidates()) {
      const { ok, data } = await postTemplate(to, lang, opts.params);
      if (ok) {
        console.log(
          `[wa:cliente] enviado a ${to} · lang=${lang} · id=${data?.messages?.[0]?.id ?? "?"}` +
            (lang !== WA_LANG ? ` ← ponle WHATSAPP_TEMPLATE_LANG=${lang} en Vercel` : "")
        );
        return { ok: true, to, lang };
      }
      last = data;
      // 132001 = la plantilla no existe en ESE idioma → probar el siguiente.
      // Cualquier otro error (token, número, plantilla pausada) no se arregla
      // cambiando de idioma: cortamos aquí.
      if (data?.error?.code !== 132001) break;
      console.warn(`[wa:cliente] plantilla no existe en ${lang}, probando siguiente…`);
    }
    console.error(`[wa:cliente] Meta rechazó (to=${to}, template=${WA_TEMPLATE}):`, JSON.stringify(last));
    return { ok: false, to, error: last };
  } catch (e) {
    console.error("[wa:cliente] error:", e);
    return { ok: false, to, error: String(e) };
  }
}
