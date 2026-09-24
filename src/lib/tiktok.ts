// Verificación de la cuenta de TikTok del cliente vía oEmbed (endpoint PÚBLICO
// y oficial de TikTok, el mismo que usan los "embeds" de perfil).
//
// Qué da: si la cuenta existe y su nombre visible. Qué NO da: seguidores,
// videos, vistas. TikTok no ofrece una API para leer cuentas ajenas; los
// números reales solo llegan si el dueño conecta su cuenta (Display API con
// Login de TikTok). Aun así, pasar de "lo compartió pero no lo vimos" a
// "confirmamos que @x existe" evita que el informe hable de una cuenta mal
// escrita. Nunca lanza.

export type EstadoTiktok = "verificado" | "no_encontrado" | "no_verificado";

export interface VerificacionTiktok {
  estado: EstadoTiktok;
  usuario?: string;
  nombre?: string; // nombre visible (author_name)
  detalle?: string;
}

/**
 * "@Chok.Bake", "https://www.tiktok.com/@bujarras2?_r=1&_t=…", "@merbaiardi (59K)"
 * → "chok.bake" / "bujarras2" / "merbaiardi". "" si no parece un usuario.
 */
export function limpiarTiktok(v?: string): string {
  const t = (v || "").trim();
  if (!t || /\S+@\S+\.\S+/.test(t)) return ""; // vacío o un correo
  if (/^(https?:\/\/|www\.)/i.test(t) && !/tiktok\.com/i.test(t)) return ""; // otra web
  const sinUrl = t.replace(/^https?:\/\/(www\.|m\.|vm\.)?tiktok\.com\//i, "");
  const primero = sinUrl.split(/[\s,;|(]+/).find(Boolean) ?? "";
  const u = primero.replace(/[/?#].*$/, "").replace(/^@+/, "").toLowerCase();
  // TikTok: letras, números, guion bajo y punto; hasta 24 caracteres.
  return /^[a-z0-9._]{2,24}$/.test(u) ? u : "";
}

async function consultar(usuario: string): Promise<Response> {
  const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${usuario}`)}`;
  return fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { accept: "application/json" },
  });
}

export async function verificarTiktok(valor?: string): Promise<VerificacionTiktok> {
  const usuario = limpiarTiktok(valor);
  if (!usuario) {
    return { estado: "no_encontrado", detalle: `"${valor}" no parece un usuario de TikTok.` };
  }
  try {
    let res = await consultar(usuario);
    // TikTok limita por IP: un reintento corto antes de rendirse.
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await consultar(usuario);
    }
    if (res.status === 429 || res.status >= 500) {
      return { estado: "no_verificado", usuario, detalle: `TikTok respondió ${res.status}` };
    }
    const texto = await res.text();
    let data: { author_name?: string; author_url?: string; embed_product_id?: string } | null = null;
    try {
      data = JSON.parse(texto);
    } catch {
      data = null;
    }
    if (res.ok && data && (data.author_url || data.embed_product_id)) {
      return { estado: "verificado", usuario, nombre: data.author_name };
    }
    // 4xx o respuesta sin perfil: TikTok no reconoce ese usuario (mal escrito,
    // cambiado o privado). No se afirma que "no existe": solo que no apareció.
    return { estado: "no_encontrado", usuario, detalle: `TikTok no devolvió el perfil (${res.status})` };
  } catch (e) {
    return { estado: "no_verificado", usuario, detalle: e instanceof Error ? e.message : "fallo de red" };
  }
}
