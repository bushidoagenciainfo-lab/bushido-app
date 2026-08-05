import { NextResponse } from "next/server";
import { z } from "zod";
import { listCreadores, updateCreador, type CreadorRow } from "@/lib/creadores";
import { businessDiscovery, hasInstagram } from "@/lib/instagram";
import { clasificarCreador } from "@/lib/clasificar-creador";

export const runtime = "nodejs";
export const maxDuration = 60;

// Deja margen para responder antes de que la plataforma corte la función.
const PRESUPUESTO_MS = 45_000;

const schema = z.object({
  id: z.string().trim().max(80).optional(), // una sola ficha
  todos: z.boolean().optional(), // recorre las incompletas
  conNicho: z.boolean().optional().default(true), // además deduce nicho/formatos
});

interface Reporte {
  usuario: string;
  nombre: string;
  ok: boolean;
  seguidores?: number;
  nichos?: string[];
  error?: string;
}

/**
 * Completa el book con datos reales de Instagram (Business Discovery) y, si hay
 * material, deduce nicho y formatos. Protegido por la cookie de admin.
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
  const { id, todos, conNicho } = parsed.data;

  let lista: CreadorRow[];
  try {
    lista = await listCreadores({ limit: 500 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "No se pudo leer el book." },
      { status: 500 }
    );
  }

  let objetivo = id ? lista.filter((c) => c.id === id) : lista;
  if (!id && todos) {
    // solo las que les falta algo y tienen instagram
    objetivo = objetivo.filter((c) => c.instagram && (!c.seguidores || !c.nichos?.length));
  }
  objetivo = objetivo.filter((c) => c.instagram);

  const t0 = Date.now();
  const reportes: Reporte[] = [];
  let pendientes = 0;

  for (const c of objetivo) {
    if (Date.now() - t0 > PRESUPUESTO_MS) {
      pendientes = objetivo.length - reportes.length;
      break;
    }
    const usuario = c.instagram as string;
    const r = await businessDiscovery(usuario);
    if (!r.ok || !r.perfil) {
      reportes.push({ usuario, nombre: c.nombre, ok: false, error: r.error });
      continue;
    }

    const campos: Parameters<typeof updateCreador>[1] = {};
    if (typeof r.perfil.followers_count === "number") {
      campos.seguidores = r.perfil.followers_count;
    }

    // nicho/formatos: solo si faltan y hay material para leer
    let nichos: string[] | undefined;
    if (conNicho && !c.nichos?.length) {
      try {
        const s = await clasificarCreador(r.perfil);
        if (s) {
          campos.nichos = s.nichos;
          if (!c.formatos?.length) campos.formatos = s.formatos;
          if (!c.notas && s.resumen) campos.notas = s.resumen;
          nichos = s.nichos;
        }
      } catch (e) {
        console.error("clasificarCreador:", e);
      }
    }

    try {
      await updateCreador(c.id, campos);
      reportes.push({
        usuario,
        nombre: c.nombre,
        ok: true,
        seguidores: campos.seguidores ?? undefined,
        nichos,
      });
    } catch (e) {
      reportes.push({
        usuario,
        nombre: c.nombre,
        ok: false,
        error: e instanceof Error ? e.message : "No se pudo guardar.",
      });
    }
  }

  const logrados = reportes.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    revisados: reportes.length,
    logrados,
    fallidos: reportes.length - logrados,
    pendientes,
    reportes,
  });
}
