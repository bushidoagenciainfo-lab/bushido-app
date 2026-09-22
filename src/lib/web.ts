// Lectura rápida del sitio web del cliente.
//
// El pop-up promete "analizamos tus redes y tu web", pero hasta ahora la web
// solo llegaba al modelo como texto ("reporta web: sí") y el informe opinaba de
// páginas que nadie había abierto ("tu sitio en Canva luce como portafolio").
// Esto trae lo mínimo para hablar con evidencia: título, descripción, titulares
// y un extracto del texto visible. Nunca lanza: si no se puede leer, lo dice.

export interface LecturaWeb {
  ok: boolean;
  url?: string;
  texto?: string; // bloque listo para el prompt
  pistas?: string; // texto plano para deducir el sector
  error?: string;
}

const TIMEOUT_MS = 6000;
const MAX_BYTES = 400_000;

/** "Www.horizonteav.com" → "https://www.horizonteav.com/" (o null si no es una URL usable). */
export function normalizarUrl(v?: string): URL | null {
  const t = (v || "").trim();
  if (!t || /\s/.test(t) || /\S+@\S+\.\S+/.test(t) && !/^https?:/i.test(t)) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname.toLowerCase();
    // Nada de redes internas: la URL la escribe un desconocido en un formulario.
    if (
      !h.includes(".") ||
      h === "localhost" ||
      h.endsWith(".local") ||
      h.endsWith(".internal") ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(h) ||
      h.includes(":")
    ) {
      return null;
    }
    // Instagram/TikTok no son "su web" y tampoco se dejan leer así.
    if (/(^|\.)(instagram|tiktok|facebook)\.com$/.test(h)) return null;
    return u;
  } catch {
    return null;
  }
}

function limpiar(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html: string, nombre: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${nombre}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${nombre}["']`,
    "i"
  );
  const m = html.match(re);
  return limpiar(m?.[1] ?? m?.[2] ?? "");
}

/** Corta sin partir emojis (un surrogate suelto rompe el JSON que va a la API). */
function recortar(s: string, n: number): string {
  const cps = Array.from(s);
  return cps.length > n ? cps.slice(0, n).join("") + "…" : s;
}

export async function leerWeb(valor?: string): Promise<LecturaWeb> {
  const url = normalizarUrl(valor);
  if (!url) return { ok: false, error: valor ? `"${valor}" no es una URL que podamos abrir.` : "sin web" };

  try {
    // Redirecciones a mano: cada salto se valida igual que la URL original,
    // para que un "www.algo.com" no termine apuntando a una red interna.
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    let actual: URL = url;
    let res: Response | null = null;
    for (let salto = 0; salto < 4; salto++) {
      res = await fetch(actual, {
        signal,
        redirect: "manual",
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; BushidoAnalisis/1.0; +https://bushidoav.com)",
          accept: "text/html,application/xhtml+xml",
        },
      });
      const destino = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!destino) break;
      const siguiente = normalizarUrl(new URL(destino, actual).href);
      if (!siguiente) return { ok: false, url: actual.href, error: "la web redirige a una dirección que no abrimos" };
      actual = siguiente;
      res = null;
    }
    if (!res) return { ok: false, url: url.href, error: "demasiadas redirecciones" };
    if (!res.ok) return { ok: false, url: actual.href, error: `la web respondió ${res.status}` };
    const tipo = res.headers.get("content-type") || "";
    if (!/html/i.test(tipo)) return { ok: false, url: actual.href, error: `no es una página HTML (${tipo || "sin tipo"})` };

    // Lee como mucho MAX_BYTES: hay "webs" que son un video o un PDF enorme.
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const dec = new TextDecoder();
      let total = 0;
      while (total < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        html += dec.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } else {
      html = (await res.text()).slice(0, MAX_BYTES);
    }

    const titulo = limpiar(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const descripcion = meta(html, "description") || meta(html, "og:description");
    const titulares = Array.from(html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi))
      .map((m) => limpiar(m[1].replace(/<[^>]+>/g, " ")))
      .filter((t) => t.length > 2)
      .slice(0, 8);
    const visible = limpiar(
      html
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
        // Si el corte de MAX_BYTES cayó dentro de un <script> (Wix pesa >400KB),
        // lo que queda sin cerrar también es código, no texto.
        .replace(/<(script|style|noscript|svg|template)\b[\s\S]*$/i, " ")
        .replace(/<[^>]+>/g, " ")
    );
    const botones = /reserv|agend|cotiz|comprar|carrito|whatsapp|wa\.me|contact/i;
    const accion = Array.from(new Set((visible.match(new RegExp(botones.source, "gi")) ?? []).map((s) => s.toLowerCase()))).slice(0, 6);

    // Una web armada solo con JavaScript (sin texto en el HTML) no se puede leer así.
    const casiVacia = visible.length < 120 && !descripcion;
    const texto = [
      `LECTURA DE SU SITIO WEB (${actual.href}) — lo leímos ahora; esto SÍ lo viste:`,
      titulo ? `Título: "${recortar(titulo, 120)}"` : "Título: (sin título)",
      descripcion ? `Descripción: "${recortar(descripcion, 240)}"` : "Descripción: (no tiene meta descripción)",
      titulares.length ? `Titulares: ${titulares.map((t) => `"${recortar(t, 90)}"`).join(" · ")}` : "",
      accion.length ? `Palabras de acción encontradas: ${accion.join(", ")}` : "No encontramos palabras de acción (reservar, agendar, cotizar, comprar, WhatsApp, contacto).",
      casiVacia
        ? "⚠️ La página casi no tiene texto legible en el HTML (se arma con JavaScript): NO opines de su contenido ni de su diseño."
        : `Extracto del texto visible: "${recortar(visible, 900)}"`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      ok: true,
      url: actual.href,
      texto,
      pistas: recortar([titulo, descripcion, ...titulares, recortar(visible, 600)].join(" "), 1200),
    };
  } catch (e) {
    return { ok: false, url: url.href, error: e instanceof Error ? e.message : "no se pudo abrir" };
  }
}
