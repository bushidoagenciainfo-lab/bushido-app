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

export interface IgResultado {
  ok: boolean;
  perfil?: IgPerfil;
  error?: string;
}

/** Quita @, espacios y URLs completas: deja el username limpio. */
export function limpiarUsuario(v: string): string {
  return v
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?].*$/, "")
    .replace(/^@/, "")
    .trim();
}

/**
 * Consulta un perfil por username. Devuelve `ok:false` con el motivo en vez de
 * lanzar, para poder recorrer el book entero sin que una cuenta rompa el lote.
 */
export async function businessDiscovery(usuario: string): Promise<IgResultado> {
  if (!hasInstagram()) {
    return { ok: false, error: "Falta IG_USER_ID / IG_ACCESS_TOKEN." };
  }
  const username = limpiarUsuario(usuario);
  if (!username || /\s/.test(username)) {
    return { ok: false, error: `"${usuario}" no parece un usuario de Instagram.` };
  }

  const campos =
    `business_discovery.username(${username})` +
    `{username,name,biography,website,followers_count,media_count,` +
    `media.limit(6){caption,like_count,comments_count,media_type,permalink}}`;
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
          error: `@${username}: no existe o es cuenta personal (Business Discovery solo ve cuentas Business/Creator).`,
        };
      }
      if (/access token/i.test(m)) {
        return { ok: false, error: `Token de Instagram inválido o vencido: ${m}` };
      }
      // (#10) no es culpa de la cuenta consultada: es configuración nuestra
      if (data.error.code === 10 || /does not have permission/i.test(m)) {
        return {
          ok: false,
          error:
            "(#10) Al token le falta el permiso instagram_manage_insights (el que " +
            "habilita leer OTRAS cuentas). Regenera el token del usuario del sistema " +
            "marcándolo. Verifica en /api/admin/diag → bloque «instagram».",
        };
      }
      return { ok: false, error: `@${username}: ${m}` };
    }
    if (!data.business_discovery) {
      return { ok: false, error: `@${username}: Meta no devolvió datos.` };
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
      error: `@${username}: ${e instanceof Error ? e.message : "fallo de red"}`,
    };
  }
}
