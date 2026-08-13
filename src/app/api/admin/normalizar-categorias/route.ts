import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizarCategoria } from "@/lib/analisis";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Colapsa las categorías escritas a mano a la lista cerrada, EN LA BASE.
 *
 * El agrupado ya normaliza al vuelo, pero si no se persiste, cada consulta
 * vuelve a adivinar y el OS sigue recibiendo el texto viejo.
 *
 * GET  → simulacro: muestra qué cambiaría, sin tocar nada.
 * POST → aplica los cambios.
 */
async function revisar(aplicar: boolean) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: "Supabase no está configurado." };

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("analisis").select("id, marca, nicho, categoria").limit(1000);
  if (error) return { ok: false, error: error.message };

  const filas = data ?? [];
  const cambios: Array<{ id: string; marca: string; de: string; a: string }> = [];

  for (const f of filas) {
    const antes = (f.categoria as string) || (f.nicho as string) || "";
    const despues = normalizarCategoria(f.categoria as string, f.nicho as string);
    if (antes !== despues) {
      cambios.push({ id: f.id as string, marca: (f.marca as string) || "—", de: antes || "(vacía)", a: despues });
    }
  }

  if (aplicar) {
    for (const c of cambios) {
      const { error: e } = await db.from("analisis").update({ categoria: c.a }).eq("id", c.id);
      if (e) console.error(`[normalizar] ${c.marca}:`, e.message);
    }
  }

  // Cómo queda el reparto por categoría después de colapsar
  const reparto: Record<string, number> = {};
  for (const f of filas) {
    const cat = normalizarCategoria(f.categoria as string, f.nicho as string);
    reparto[cat] = (reparto[cat] ?? 0) + 1;
  }
  const ordenado = Object.entries(reparto)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, marcas]) => ({
      categoria,
      marcas,
      // el OS necesita 3 para considerar que hay patrón
      hacePatron: marcas >= 3,
    }));

  return {
    ok: true,
    aplicado: aplicar,
    analisis: filas.length,
    categorias_antes: new Set(filas.map((f) => (f.categoria as string) || (f.nicho as string) || "")).size,
    categorias_despues: ordenado.length,
    con_patron: ordenado.filter((c) => c.hacePatron).length,
    cambios: cambios.slice(0, 60),
    reparto: ordenado,
  };
}

export async function GET() {
  const r = await revisar(false);
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}

export async function POST() {
  const r = await revisar(true);
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
