import { NextResponse } from "next/server";
import { z } from "zod";
import { storeEvent } from "@/lib/events";
import { forwardToServer } from "@/lib/forward";

export const runtime = "nodejs";

const schema = z.object({
  type: z.string().trim().min(1).max(40),
  name: z.string().trim().max(160).optional(),
  path: z.string().trim().max(300).optional(),
  ref: z.string().trim().max(300).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

/** Registra un evento de interés (CTA, servicio, vista de página, etc.). Público. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }
  const e = parsed.data;
  // guardar + reenviar a tu servidor (ambos best-effort, no bloquean la respuesta)
  storeEvent(e).catch((err) => console.error("storeEvent:", err));
  forwardToServer("event", e).catch(() => {});
  return NextResponse.json({ ok: true });
}
