// Instagram Business Discovery (Meta Graph API).
//
// Permite consultar datos PÚBLICOS de otras cuentas de Instagram desde nuestra
// propia cuenta business: seguidores, biografía y últimas publicaciones.
// Es la vía oficial — nada de scraping.
//
// Requisitos (se configuran una vez en Vercel):
//   IG_USER_ID      → id de la cuenta de Instagram business de Bushido (@bushido.aa)
//   IG_ACCESS_TOKEN → token con instagram_basic + pages_read_engagement
//
// ⚠️ LÍMITE DE META: solo devuelve cuentas **Business o Creator**. Las cuentas
// personales no son consultables por esta API (no hay forma legítima de verlas).

const GRAPH = process.env.IG_GRAPH_VERSION || "v21.0";
const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

export function hasInstagram(): boolean {
  return Boolean(IG_USER_ID && IG_ACCESS_TOKEN);
}

export interface IgMedia {
  caption?: string;
  like_count?: number;
  comments_count?: number;
  media_type?: string;
  media_product_type?: string; // FEED | REELS | STORY…
  timestamp?: string; // ISO — sin esto no se puede hablar de frecuencia
  permalink?: string;
}

export interface IgPerfil {
  username: string;
  name?: string;
  biography?: string;
  website?: string;
  followers_count?: number;
  media_count?: number;
  media?: IgMedia[];
}

/**
 * Por qué no se pudo leer la cuenta. Importa distinguirlo: "no es profesional"
 * es algo que se le puede decir al cliente; un fallo nuestro NO (el informe de
 * Frenchie le dijo "no eres cuenta profesional" a una cuenta business de 18k
 * seguidores porque el usuario venía con mayúscula).
 */
export type IgMotivo =
  | "no_existe_o_personal" // (#110) Meta no la encuentra como Business/Creator
  | "usuario_invalido" // lo escrito no es un usuario (una web, un correo…)
  | "config" // token/permisos: problema nuestro
  | "red"; // timeout o error de Meta

export interface IgResultado {
  ok: boolean;
  perfil?: IgPerfil;
  error?: string;
  motivo?: IgMotivo;
}

/**
 * Deja el username limpio: sin @, sin URL, sin query (?igsh=…) y en minúsculas
 * (los usuarios de Instagram lo son; con mayúscula Business Discovery no
 * encuentra la cuenta). Si escribieron dos handles, toma el primero.
 * Devuelve "" si lo escrito claramente no es un usuario de Instagram.
 */
export function limpiarUsuario(v: string): string {
  const t = (v || "").trim();
  if (!t || /\S+@\S+\.\S+/.test(t)) return ""; // vacío o un correo
  // Una URL que no es de Instagram (web, portafolio, linktree) no es un usuario.
  if (/^(https?:\/\/|www\.)/i.test(t) && !/instagram\.com\//i.test(t)) return "";
  const partes = t
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .split(/[\s,;|]+/)
    .filter(Boolean);
  // "@a @b" → dos cuentas: la primera. "zoraida _cardenas" → un espacio que se
  // coló: se une. "Marlon Cáceres" (un nombre, no un usuario) → no pasa el filtro.
  const candidato = partes.length > 1 && !partes[0].startsWith("@") ? partes.join("") : partes[0] ?? "";
  const u = candidato
    .replace(/[/?#].*$/, "")
    .replace(/^@+/, "")
    .toLowerCase()
    .trim();
  // Instagram: letras, números, punto y guion bajo; hasta 30 caracteres.
  return /^[a-z0-9._]{1,30}$/.test(u) ? u : "";
}

/** ¿Lo que escribió en el campo Instagram es en realidad un link a otra web? */
export function pareceWebNoInstagram(v?: string): string | null {
  const t = (v || "").trim();
  if (/^(https?:\/\/|www\.)/i.test(t) && !/instagram\.com/i.test(t)) return t;
  return null;
}

/**
 * Consulta un perfil por username. Devuelve `ok:false` con el motivo en vez de
 * lanzar, para poder recorrer el book entero sin que una cuenta rompa el lote.
 */
export async function businessDiscovery(usuario: string): Promise<IgResultado> {
  if (!hasInstagram()) {
    return { ok: false, motivo: "config", error: "Falta IG_USER_ID / IG_ACCESS_TOKEN." };
  }
  const username = limpiarUsuario(usuario);
  if (!username) {
    return {
      ok: false,
      motivo: "usuario_invalido",
      error: `"${usuario}" no parece un usuario de Instagram.`,
    };
  }

  const campos =
    `business_discovery.username(${username})` +
    `{username,name,biography,website,followers_count,media_count,` +
    `media.limit(6){caption,like_count,comments_count,media_type,media_product_type,timestamp,permalink}}`;
  const url =
    `https://graph.facebook.com/${GRAPH}/${IG_USER_ID}` +
    `?fields=${encodeURIComponent(campos)}` +
    `&access_token=${encodeURIComponent(IG_ACCESS_TOKEN as string)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = (await res.json()) as {
      business_discovery?: IgPerfil & { media?: { data?: IgMedia[] } | IgMedia[] };
      error?: { message?: string; code?: number; error_subcode?: number };
    };

    if (data.error) {
      const m = data.error.message || "Error de Meta";
      // (#110) = la cuenta no existe o NO es business/creator
      if (data.error.code === 110 || /does not exist|cannot be found/i.test(m)) {
        return {
          ok: false,
          motivo: "no_existe_o_personal",
          error: `@${username}: no existe o es cuenta personal (Business Discovery solo ve cuentas Business/Creator).`,
        };
      }
      if (/access token/i.test(m)) {
        return { ok: false, motivo: "config", error: `Token de Instagram inválido o vencido: ${m}` };
      }
      // (#10) no es culpa de la cuenta consultada: es configuración nuestra
      if (data.error.code === 10 || /does not have permission/i.test(m)) {
        return {
          ok: false,
          motivo: "config",
          error:
            "(#10) Al token le falta el permiso instagram_manage_insights (el que " +
            "habilita leer OTRAS cuentas). Regenera el token del usuario del sistema " +
            "marcándolo. Verifica en /api/admin/diag → bloque «instagram».",
        };
      }
      return { ok: false, motivo: "red", error: `@${username}: ${m}` };
    }
    if (!data.business_discovery) {
      return { ok: false, motivo: "red", error: `@${username}: Meta no devolvió datos.` };
    }
    // Meta envuelve las publicaciones en { media: { data: [...] } }, no en un
    // array plano. Lo normalizamos aquí para que quien lo use reciba siempre
    // un array (antes reventaba con "(i.media ?? []).map is not a function").
    const bd = data.business_discovery;
    const bruto = bd.media as IgMedia[] | { data?: IgMedia[] } | undefined;
    const media = Array.isArray(bruto) ? bruto : (bruto?.data ?? []);
    return { ok: true, perfil: { ...bd, media } };
  } catch (e) {
    return {
      ok: false,
      motivo: "red",
      error: `@${username}: ${e instanceof Error ? e.message : "fallo de red"}`,
    };
  }
}
