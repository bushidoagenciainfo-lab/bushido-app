import { NextResponse } from "next/server";
import { z } from "zod";
import { setCreadorEstado } from "@/lib/creadores";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().trim().min(1).max(80),
  estado: z.enum(["nuevo", "aprobado", "destacado", "pausado"]),
});

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
  try {
    await setCreadorEstado(parsed.data.id, parsed.data.estado);
  } catch (err) {
    console.error("setCreadorEstado:", err);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
