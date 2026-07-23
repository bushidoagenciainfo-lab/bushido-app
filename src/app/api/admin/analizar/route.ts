import { NextResponse } from "next/server";
import { z } from "zod";
import { generarAnalisis, hasIA } from "@/lib/analizar";
import { storeAnalisis, informeUrl, emailInformeListo } from "@/lib/analisis-store";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = z.object({
  marca: z.string().trim().min(1).max(160),
  redes: z.string().trim().max(300).optional(),
  web: z.string().trim().max(300).optional(),
  contexto: z.string().trim().max(2000).optional(),
  leadId: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  nombre: z.string().trim().max(120).optional(),
  enviarCliente: z.boolean().optional(), // si true y hay email, le manda el informe
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
  const { marca, redes, web, contexto, leadId, email, nombre, enviarCliente } = parsed.data;

  let analisis;
  try {
    analisis = await generarAnalisis({ marca, redes, web, contexto });
  } catch (err) {
    console.error("generarAnalisis:", err);
    return NextResponse.json({ ok: false, error: "El análisis falló." }, { status: 502 });
  }
  if (!analisis) {
    return NextResponse.json({ ok: false, error: "No se pudo generar el análisis." }, { status: 502 });
  }

  let id: string;
  try {
    id = await storeAnalisis(analisis, leadId);
  } catch (err) {
    console.error("storeAnalisis:", err);
    return NextResponse.json({ ok: false, error: "No pudimos guardar el análisis." }, { status: 500 });
  }

  const url = informeUrl(id);
  if (enviarCliente && email) {
    emailInformeListo({ email, nombre, marca, url }).catch((e) => console.error("emailInformeListo:", e));
  }
  return NextResponse.json({ ok: true, id, url });
}
