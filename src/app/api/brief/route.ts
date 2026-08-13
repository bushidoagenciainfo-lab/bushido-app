import { NextResponse } from "next/server";
import { BRIEF_CLAVES } from "@/lib/brief";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Recibe el brief de onboarding y lo manda a Bushido OS.
 *
 * Va por el servidor (no desde el navegador) para no exponer el secreto del
 * OS en el cliente. Si el OS está caído devolvemos error para que la página
 * ofrezca el respaldo por correo — el brief es demasiado trabajo del cliente
 * como para perderlo en silencio.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envío inválido." }, { status: 400 });
  }

  // honeypot: los bots rellenan el campo oculto
  if (typeof body.website_hp === "string" && body.website_hp) {
    return NextResponse.json({ ok: true });
  }

  // solo las claves conocidas y con contenido
  const datos: Record<string, string> = {};
  for (const clave of BRIEF_CLAVES) {
    const v = body[clave];
    if (typeof v === "string" && v.trim()) datos[clave] = v.trim().slice(0, 4000);
  }
  if (!datos.nombre) {
    return NextResponse.json(
      { ok: false, error: "Falta el nombre del negocio." },
      { status: 422 }
    );
  }

  const url = process.env.BUSHIDO_OS_URL;
  const secret = process.env.SITIO_WEB_SECRET;
  if (!url || !secret) {
    console.error("[brief] falta BUSHIDO_OS_URL o SITIO_WEB_SECRET");
    return NextResponse.json(
      { ok: false, error: "El destino del brief no está configurado." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/api/brief`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bushido-sitio": secret },
      body: JSON.stringify(datos),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      console.error(`[brief] Bushido OS respondió ${res.status}: ${detalle.slice(0, 300)}`);
      return NextResponse.json(
        { ok: false, error: `El servidor respondió ${res.status}.` },
        { status: 502 }
      );
    }
    console.log(`[brief] recibido de "${datos.nombre}" y enviado a Bushido OS`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[brief] no se pudo enviar:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "No se pudo enviar." },
      { status: 502 }
    );
  }
}
