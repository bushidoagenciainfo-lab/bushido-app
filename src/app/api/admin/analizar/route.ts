import { NextResponse } from "next/server";
import { z } from "zod";
import { generarAnalisis, hasIA } from "@/lib/analizar";
import { storeAnalisis, informeUrl, emailInformeListo } from "@/lib/analisis-store";

export const runtime = "nodejs";
export const maxDuration = 120;

// `nullish()` porque Supabase devuelve null (no undefined) en los campos vacíos:
// con .optional() el panel fallaba con "Datos inválidos".
const schema = z.object({
  marca: z.string().trim().min(1).max(160),
  redes: z.string().trim().max(300).nullish(),
  tiktok: z.string().trim().max(300).nullish(),
  web: z.string().trim().max(300).nullish(),
  contexto: z.string().trim().max(2000).nullish(),
  leadId: z.string().trim().max(80).nullish(),
  email: z.string().trim().max(160).nullish(),
  nombre: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
  enviarCliente: z.boolean().nullish(), // si true y hay email, le manda el informe
});

/**
 * Disparar el análisis de las 7 maletas desde el panel (ya autenticado por la
 * cookie de admin — no necesita el ANALIZAR_SECRET público).
 */
export async function POST(request: Request) {
  if (!hasIA()) {
    return NextResponse.json(
      { ok: false, error: "Falta ANTHROPIC_API_KEY (configúrala en Vercel)." },
      { status: 503 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos.", issues: parsed.error.issues }, { status: 422 });
  }
  const { marca, redes, tiktok, web, contexto, leadId, email, nombre, enviarCliente } = parsed.data;

  let analisis;
  try {
    analisis = await generarAnalisis({
      marca,
      redes: redes ?? undefined,
      tiktok: tiktok ?? undefined,
      web: web ?? undefined,
      contexto: contexto ?? undefined,
    });
  } catch (err) {
    console.error("generarAnalisis:", err);
    return NextResponse.json({ ok: false, error: "El análisis falló." }, { status: 502 });
  }
  if (!analisis) {
    return NextResponse.json({ ok: false, error: "No se pudo generar el análisis." }, { status: 502 });
  }

  let id: string;
  try {
    id = await storeAnalisis(analisis, leadId ?? undefined);
  } catch (err) {
    console.error("storeAnalisis:", err);
    return NextResponse.json({ ok: false, error: "No pudimos guardar el análisis." }, { status: 500 });
  }

  const url = informeUrl(id);
  if (enviarCliente && email) {
    emailInformeListo({ email, nombre: nombre ?? undefined, marca, url }).catch((e) =>
      console.error("emailInformeListo:", e)
    );
  }
  return NextResponse.json({ ok: true, id, url });
}
