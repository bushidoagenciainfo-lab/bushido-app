import { NextResponse } from "next/server";
import { z } from "zod";
import { listCreadores, updateCreador, type CreadorRow } from "@/lib/creadores";
import { businessDiscovery, hasInstagram, type IgPerfil } from "@/lib/instagram";
import { clasificarCreador } from "@/lib/clasificar-creador";

export const runtime = "nodejs";
export const maxDuration = 60;

// Margen para responder antes de que la plataforma corte la función.
const PRESUPUESTO_MS = 48_000;
// Instagram responde rápido: se puede consultar en paralelo sin problema.
const TANDA_IG = 8;
// Claude es lento (10-20s cada uno): menos en paralelo, pero en paralelo.
const TANDA_IA = 4;

const schema = z.object({
  id: z.string().trim().max(80).optional(), // una sola ficha
  todos: z.boolean().optional(), // recorre el book
  conNicho: z.boolean().optional().default(true),
});

interface Reporte {
  usuario: string;
  nombre: string;
  ok: boolean;
  seguidores?: number;
  nichos?: string[];
  formatos?: string[];
  error?: string;
}

/** Ejecuta en tandas de `n` a la vez (no todo de golpe, no de uno en uno). */
async function enTandas<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += n) {
    out.push(...(await Promise.all(items.slice(i, i + n).map(fn))));
  }
  return out;
}

/**
 * Completa el book con datos reales de Instagram.
 *
 * Va en dos fases porque tienen velocidades muy distintas:
 *   1) Seguidores — Instagram responde en ~300ms → se traen TODOS de una pasada.
 *   2) Nicho y formatos — Claude tarda 10-20s → se hace con lo que quede de tiempo.
 * Así, aunque el tiempo se acabe, al menos los seguidores quedan completos.
 */
export async function POST(request: Request) {
  if (!hasInstagram()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Falta conectar Instagram: pon IG_USER_ID e IG_ACCESS_TOKEN en Vercel (ver GUIA-INSTAGRAM.md).",
      },
      { status: 503 }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* sin cuerpo = todos */
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }
  const { id, conNicho } = parsed.data;

  let lista: CreadorRow[];
  try {
    lista = await listCreadores({ limit: 500 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "No se pudo leer el book." },
      { status: 500 }
    );
  }

  const objetivo = (id ? lista.filter((c) => c.id === id) : lista).filter((c) => c.instagram);
  if (!objetivo.length) {
    return NextResponse.json({
      ok: true,
      revisados: 0,
      logrados: 0,
      fallidos: 0,
      pendientes: 0,
      reportes: [],
      nota: "Ninguna ficha tiene usuario de Instagram para consultar.",
    });
  }

  const t0 = Date.now();
  const reportes = new Map<string, Reporte>();
  const perfiles = new Map<string, IgPerfil>();

  // ── Fase 1: seguidores (rápida, en paralelo) ──
  await enTandas(objetivo, TANDA_IG, async (c) => {
    const usuario = c.instagram as string;
    const base: Reporte = { usuario, nombre: c.nombre, ok: false };
    const r = await businessDiscovery(usuario);
    if (!r.ok || !r.perfil) {
      reportes.set(c.id, { ...base, error: r.error });
      return;
    }
    perfiles.set(c.id, r.perfil);
    // Los seguidores se refrescan SIEMPRE: son un dato que cambia.
    if (typeof r.perfil.followers_count === "number") {
      try {
        await updateCreador(c.id, { seguidores: r.perfil.followers_count });
        reportes.set(c.id, { ...base, ok: true, seguidores: r.perfil.followers_count });
      } catch (e) {
        reportes.set(c.id, {
          ...base,
          error: e instanceof Error ? e.message : "No se pudo guardar.",
        });
      }
    } else {
      reportes.set(c.id, { ...base, ok: true });
    }
  });

  // ── Fase 2: nicho y formatos (lenta, con lo que quede de tiempo) ──
  // Se evalúan por separado: una ficha puede tener nicho pero no formato.
  let pendientes = 0;
  if (conNicho) {
    const porClasificar = objetivo.filter(
      (c) => perfiles.has(c.id) && (!c.nichos?.length || !c.formatos?.length)
    );

    for (let i = 0; i < porClasificar.length; i += TANDA_IA) {
      if (Date.now() - t0 > PRESUPUESTO_MS) {
        pendientes = porClasificar.length - i;
        break;
      }
      await Promise.all(
        porClasificar.slice(i, i + TANDA_IA).map(async (c) => {
          const perfil = perfiles.get(c.id);
          if (!perfil) return;
          const previo = reportes.get(c.id);
          try {
            const s = await clasificarCreador(perfil);
            if (!s) return;
            const campos: Parameters<typeof updateCreador>[1] = {};
            if (!c.nichos?.length) campos.nichos = s.nichos;
            if (!c.formatos?.length) campos.formatos = s.formatos;
            if (!c.notas && s.resumen) campos.notas = s.resumen;
            if (!Object.keys(campos).length) return;
            await updateCreador(c.id, campos);
            reportes.set(c.id, {
              ...(previo ?? { usuario: c.instagram as string, nombre: c.nombre, ok: true }),
              ok: true,
              nichos: campos.nichos,
              formatos: campos.formatos,
            });
          } catch (e) {
            console.error(`clasificarCreador @${c.instagram}:`, e);
            if (previo?.ok) {
              reportes.set(c.id, {
                ...previo,
                error: `seguidores ok, pero el nicho falló: ${
                  e instanceof Error ? e.message : "error"
                }`,
              });
            }
          }
        })
      );
    }
  }

  const todos = [...reportes.values()];
  const logrados = todos.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    revisados: todos.length,
    logrados,
    fallidos: todos.length - logrados,
    conSeguidores: todos.filter((r) => typeof r.seguidores === "number").length,
    conNicho: todos.filter((r) => r.nichos?.length).length,
    pendientes,
    reportes: todos,
  });
}
