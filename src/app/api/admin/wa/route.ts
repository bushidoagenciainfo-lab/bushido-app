import { NextResponse } from "next/server";
import { z } from "zod";
import { listMensajes, marcarLeidos, guardarMensaje } from "@/lib/wa-inbox";
import { sendTextoLibre } from "@/lib/whatsapp";
import { borradorRespuesta } from "@/lib/wa-asistente";

export const runtime = "nodejs";
export const maxDuration = 60;

/** GET /api/admin/wa?wa_id=57300...  → la conversación con ese contacto */
export async function GET(request: Request) {
  const wa_id = new URL(request.url).searchParams.get("wa_id");
  if (!wa_id) return NextResponse.json({ ok: false, error: "Falta wa_id." }, { status: 422 });
  try {
    const mensajes = await listMensajes(wa_id);
    await marcarLeidos(wa_id);
    return NextResponse.json({ ok: true, mensajes });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error leyendo la conversación." },
      { status: 500 }
    );
  }
}

const schema = z.object({
  wa_id: z.string().trim().min(6).max(20),
  texto: z.string().trim().max(3000).optional(),
  /** true = no envía nada, solo redacta una propuesta de respuesta */
  borrador: z.boolean().optional(),
});

/** POST → envía un mensaje, o pide un borrador al asistente. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }
  const { wa_id, texto, borrador } = parsed.data;

  // ── Modo borrador: propone qué contestar, NO envía ──
  if (borrador) {
    try {
      const sugerencia = await borradorRespuesta(wa_id);
      return NextResponse.json({ ok: true, borrador: sugerencia });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : "No se pudo redactar." },
        { status: 500 }
      );
    }
  }

  if (!texto) return NextResponse.json({ ok: false, error: "Escribe el mensaje." }, { status: 422 });

  const r = await sendTextoLibre({ phone: wa_id, texto });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 502 });

  await guardarMensaje({
    wa_id,
    direccion: "saliente",
    texto,
    tipo: "text",
    message_id: r.id ?? null,
  });
  return NextResponse.json({ ok: true, id: r.id });
}
