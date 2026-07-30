import { NextResponse } from "next/server";
import { CREADORES_SEED } from "@/lib/creadores-seed";
import { storeCreador, listCreadores } from "@/lib/creadores";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Importa la base inicial de creadores al book (un clic desde /admin).
 * Idempotente: no duplica a quien ya esté (compara nombre + ciudad).
 */
export async function POST() {
  let existentes: Awaited<ReturnType<typeof listCreadores>> = [];
  try {
    existentes = await listCreadores({ limit: 1000 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // El error típico aquí es que falte la tabla: lo decimos claro.
    return NextResponse.json(
      {
        ok: false,
        error: `No pude leer el book: ${msg}. ¿Ya corriste supabase/creadores.sql en Supabase?`,
      },
      { status: 500 }
    );
  }

  const yaEsta = new Set(existentes.map((c) => `${c.nombre}|${c.ciudad ?? ""}`));
  const faltan = CREADORES_SEED.filter((c) => !yaEsta.has(`${c.nombre}|${c.ciudad ?? ""}`));

  let ok = 0;
  const errores: string[] = [];
  for (const c of faltan) {
    try {
      await storeCreador(c);
      ok++;
    } catch (err) {
      errores.push(`${c.nombre}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    ok: errores.length === 0,
    importados: ok,
    yaEstaban: CREADORES_SEED.length - faltan.length,
    total: existentes.length + ok,
    ...(errores.length ? { errores: errores.slice(0, 3) } : {}),
  });
}
