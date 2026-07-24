// Alerta interna por Telegram (respaldo de CallMeBot). Confiable, oficial, gratis.
// Setup: 1) en Telegram escribe a @BotFather → /newbot → te da un TOKEN.
//        2) escríbele algo a tu bot nuevo.
//        3) chat_id: abre https://api.telegram.org/bot<TOKEN>/getUpdates y busca
//           "chat":{"id":...}  (o usa @userinfobot). Ponlo en TELEGRAM_CHAT_ID.
// Env-gated: sin config se omite.

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;

export function hasTelegram(): boolean {
  return Boolean(TG_TOKEN && TG_CHAT);
}

export async function alertaTelegram(texto: string): Promise<void> {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: texto, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) console.error("[telegram] respondió", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("[telegram] error:", e);
  }
}
