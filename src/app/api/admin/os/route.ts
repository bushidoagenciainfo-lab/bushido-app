import { NextResponse } from "next/server";
import { leerDelOS, enviarAlOS, hasOS } from "@/lib/bushido-os";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Puente entre el panel y el cerebro. Va por el servidor para no exponer el
 * secreto del OS en el navegador.
 *
 * GET  ?que=inteligencia            → el panel completo de patrones
 * GET  ?que=briefing&categoria=x    → lo que sabemos de una categoría
 */
export async function GET(request: Request) {
  if (!hasOS()) {
    return NextResponse.json(
      { ok: false, error: "Falta BUSHIDO_OS_URL o SITIO_WEB_SECRET." },
      { status: 503 }
    );
  }
  const p = new URL(request.url).searchParams;
  const que = p.get("que") || "inteligencia";

  const ruta =
    que === "briefing"
      ? `/api/sitio/briefing?categoria=${encodeURIComponent(p.get("categoria") || "")}`
      : "/api/sitio/inteligencia";

  const r = await leerDelOS(ruta, 20000);
  if (!r.ok) {
    // Pasamos el motivo y el detalle tal como los mandó el OS: ahí está la
    // instrucción de qué arreglar.
    return NextResponse.json(
      { ok: false, error: r.error, motivo: r.motivo, detalle: r.detalle },
      { status: r.status === 401 ? 401 : 502 }
    );
  }
  return NextResponse.json({ ok: true, data: r.data });
}

/** POST → Creator Matching: qué creadores del book encajan con una marca. */
export async function POST(request: Request) {
  if (!hasOS()) {
    return NextResponse.json(
      { ok: false, error: "Falta BUSHIDO_OS_URL o SITIO_WEB_SECRET." },
      { status: 503 }
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envío inválido." }, { status: 400 });
  }

  const r = await enviarAlOS("/api/sitio/matching", body, 45000);
  if (!r.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: r.error || "El cerebro no pudo hacer el matching.",
        motivo: r.motivo,
        detalle: r.detalle,
      },
      { status: r.status === 401 ? 401 : 502 }
    );
  }
  return NextResponse.json({ ok: true, data: r.data });
}
