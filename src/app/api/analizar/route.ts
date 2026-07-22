import { NextResponse } from "next/server";
import { z } from "zod";
import { generarAnalisis, hasIA } from "@/lib/analizar";
import { storeAnalisis, informeUrl, emailInformeListo } from "@/lib/analisis-store";

export const runtime = "nodejs";
// El análisis con Claude puede tardar; damos margen (Vercel Pro respeta esto;
// en Hobby el tope es menor, pero el flujo típico es admin/manual).
export const maxDuration = 120;

const schema = z.object({
  marca: z.string().trim().min(1).max(160),
  redes: z.string().trim().max(300).optional(),
  web: z.string().trim().max(300).optional(),
  contexto: z.string().trim().max(2000).optional(),
  leadId: z.string().trim().max(80).optional(),
  // opcional: enviar el informe al cliente por correo
  email: z.string().trim().email().max(160).optional(),
  nombre: z.string().trim().max(120).optional(),
});

/**
 * Dispara la automatización de las 7 maletas: corre el análisis con Claude,
 * lo guarda y devuelve el link del informe. Protegido con un secreto
 * (ANALIZAR_SECRET) para que no sea un endpoint público — pensado para el
 * panel/admin, un webhook o una corrida manual, no para el formulario público.
 */
export async function POST(request: Request) {
  const secret = process.env.ANALIZAR_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
    }
  }

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
    return NextResponse.json(
      { ok: false, error: "Datos inválidos.", issues: parsed.error.issues },
      { status: 422 }
    );
  }
  const { marca, redes, web, contexto, leadId, email, nombre } = parsed.data;

  let analisis;
  try {
    analisis = await generarAnalisis({ marca, redes, web, contexto });
  } catch (err) {
    console.error("generarAnalisis error:", err);
    return NextResponse.json(
      { ok: false, error: "El análisis falló. Revisa los logs." },
      { status: 502 }
    );
  }
  if (!analisis) {
    return NextResponse.json({ ok: false, error: "No se pudo generar el análisis." }, { status: 502 });
  }

  let id: string;
  try {
    id = await storeAnalisis(analisis, leadId);
  } catch (err) {
    console.error("storeAnalisis error:", err);
    return NextResponse.json({ ok: false, error: "No pudimos guardar el análisis." }, { status: 500 });
  }

  const url = informeUrl(id);
  // fire-and-forget: si nos dieron correo, mandamos el link al cliente
  if (email) {
    emailInformeListo({ email, nombre, marca, url }).catch((e) =>
      console.error("emailInformeListo error:", e)
    );
  }

  return NextResponse.json({ ok: true, id, url, analisis });
}
