// Conexión con Bushido OS (el cerebro).
//
// El sitio CAPTA (leads, análisis, creadores, briefs) y el OS ANALIZA y cruza
// esa data entre nichos. Todo sale por aquí para no repetir la URL ni el
// secreto en cada ruta.

// .trim(): al pegar en Vercel es fácil que se cuele un espacio o un salto de
// línea, y el OS responde 401 sin decir por qué.
const URL_ = process.env.BUSHIDO_OS_URL?.trim();
const SECRET = process.env.SITIO_WEB_SECRET?.trim();

/**
 * Huella del secreto para comparar con el del OS SIN exponerlo:
 * longitud + primeros y últimos caracteres.
 */
export function huellaDelSecreto(): string {
  const bruto = process.env.SITIO_WEB_SECRET;
  if (!bruto) return "FALTA";
  const s = bruto.trim();
  const sospecha = bruto !== s ? " ⚠️ tenía espacios (ya los quitamos al usarlo)" : "";
  return `${s.length} caracteres · empieza "${s.slice(0, 4)}…" · termina "…${s.slice(-4)}"${sospecha}`;
}

export function hasOS(): boolean {
  return Boolean(URL_ && SECRET);
}

/** A dónde está apuntando (sin el secreto), para el diagnóstico del panel. */
export function urlDelOS(): string {
  return URL_ || "(sin configurar)";
}

export interface RespuestaOS {
  ok: boolean;
  status?: number;
  error?: string;
  /** Por qué rechazó: "sin_configurar" | "no_coincide" | "sin_cabecera"… */
  motivo?: string;
  /** Instrucción exacta del OS de qué arreglar y dónde. Es lo más útil. */
  detalle?: string;
  data?: unknown;
}

/** Lectura tipada: o vino el dato, o vino el motivo por el que no. */
export type LecturaOS<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; error: string; motivo?: string; detalle?: string };

/** Extrae motivo/detalle de un cuerpo de error del OS. */
function leerError(texto: string): { error?: string; motivo?: string; detalle?: string } {
  try {
    const j = JSON.parse(texto) as Record<string, unknown>;
    return {
      error: typeof j.error === "string" ? j.error : undefined,
      motivo: typeof j.motivo === "string" ? j.motivo : undefined,
      detalle: typeof j.detalle === "string" ? j.detalle : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Lee algo del OS (GET). Nunca lanza.
 *
 * Cuando el OS rechaza, devuelve su `motivo` y su `detalle` — que traen la
 * instrucción exacta de qué arreglar. Perderlos y decir "no respondió" sería
 * mentir: el cerebro sí respondió, dijo que la llave no sirve.
 */
export async function leerDelOS<T = unknown>(
  ruta: string,
  timeoutMs = 8000
): Promise<LecturaOS<T>> {
  if (!URL_ || !SECRET) {
    return {
      ok: false,
      error: "Falta BUSHIDO_OS_URL o SITIO_WEB_SECRET en Vercel.",
      motivo: "sin_configurar",
    };
  }
  try {
    const res = await fetch(`${URL_.replace(/\/$/, "")}${ruta}`, {
      headers: { "x-bushido-sitio": SECRET },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const texto = await res.text().catch(() => "");

    if (/^\s*<(!doctype|html)/i.test(texto)) {
      return {
        ok: false,
        status: res.status,
        error: `BUSHIDO_OS_URL no apunta a Bushido OS: ${ruta} devolvió una página web, no datos.`,
        detalle: "Revisa el valor en Vercel: debe ser la dirección del servidor, no la del sitio.",
      };
    }

    if (!res.ok) {
      const e = leerError(texto);
      console.error(`[OS] GET ${ruta} → ${res.status} ${e.motivo ?? ""} ${e.detalle ?? ""}`);
      return {
        ok: false,
        status: res.status,
        error: e.error || `El OS respondió ${res.status}.`,
        motivo: e.motivo,
        detalle: e.detalle,
      };
    }

    try {
      return { ok: true, data: JSON.parse(texto) as T };
    } catch {
      return { ok: false, status: res.status, error: "El OS devolvió algo que no es JSON." };
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo contactar al OS.",
    };
  }
}

/**
 * Envía algo al OS. Nunca lanza: si el cerebro está caído, el sitio sigue
 * funcionando y la data ya quedó guardada en Supabase.
 *
 * @param ruta ruta del OS, ej "/api/brief" o "/api/sync"
 */
export async function enviarAlOS(
  ruta: string,
  payload: unknown,
  timeoutMs = 15000
): Promise<RespuestaOS> {
  if (!URL_ || !SECRET) {
    return { ok: false, error: "Falta BUSHIDO_OS_URL o SITIO_WEB_SECRET." };
  }
  try {
    const res = await fetch(`${URL_.replace(/\/$/, "")}${ruta}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bushido-sitio": SECRET },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const texto = await res.text().catch(() => "");

    // Si vuelve HTML, la URL no apunta al OS (típico: el 404 de otra web).
    // Sin esto el panel mostraba un volcado de HTML ilegible.
    if (/^\s*<(!doctype|html)/i.test(texto)) {
      return {
        ok: false,
        status: res.status,
        error: `BUSHIDO_OS_URL no apunta a Bushido OS: ${ruta} devolvió una página web, no datos.`,
        detalle: "Revisa el valor en Vercel: debe ser la dirección del servidor, no la del sitio.",
      };
    }

    if (!res.ok) {
      const e = leerError(texto);
      console.error(`[OS] ${ruta} → ${res.status} ${e.motivo ?? ""} ${e.detalle ?? ""}`);
      return {
        ok: false,
        status: res.status,
        error: e.error || texto.slice(0, 200) || `HTTP ${res.status}`,
        motivo: e.motivo,
        detalle: e.detalle,
      };
    }
    let data: unknown = texto;
    try {
      data = JSON.parse(texto);
    } catch {
      /* el OS puede responder texto plano */
    }
    return { ok: true, status: res.status, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : "fallo de red";
    console.error(`[OS] ${ruta} falló:`, error);
    return { ok: false, error };
  }
}
