// Conexión con Bushido OS (el cerebro).
//
// El sitio CAPTA (leads, análisis, creadores, briefs) y el OS ANALIZA y cruza
// esa data entre nichos. Todo sale por aquí para no repetir la URL ni el
// secreto en cada ruta.

const URL_ = process.env.BUSHIDO_OS_URL;
const SECRET = process.env.SITIO_WEB_SECRET;

export function hasOS(): boolean {
  return Boolean(URL_ && SECRET);
}

export interface RespuestaOS {
  ok: boolean;
  status?: number;
  error?: string;
  data?: unknown;
}

/** Lee algo del OS (GET). Nunca lanza; devuelve null si no se pudo. */
export async function leerDelOS<T = unknown>(
  ruta: string,
  timeoutMs = 8000
): Promise<T | null> {
  if (!URL_ || !SECRET) return null;
  try {
    const res = await fetch(`${URL_.replace(/\/$/, "")}${ruta}`, {
      headers: { "x-bushido-sitio": SECRET },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      console.error(`[OS] GET ${ruta} respondió ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[OS] GET ${ruta} falló:`, e instanceof Error ? e.message : e);
    return null;
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
    if (!res.ok) {
      console.error(`[OS] ${ruta} respondió ${res.status}: ${texto.slice(0, 300)}`);
      return { ok: false, status: res.status, error: texto.slice(0, 300) || `HTTP ${res.status}` };
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
