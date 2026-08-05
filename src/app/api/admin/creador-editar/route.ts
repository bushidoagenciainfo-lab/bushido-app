import { NextResponse } from "next/server";
import { z } from "zod";
import { updateCreador } from "@/lib/creadores";
import { NICHOS_CREADOR, FORMATOS_CREADOR } from "@/lib/creadores-taxonomia";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().trim().min(1).max(80),
  nichos: z.array(z.enum(NICHOS_CREADOR)).max(14).optional(),
  formatos: z.array(z.enum(FORMATOS_CREADOR)).max(10).optional(),
  seguidores: z.number().int().min(0).max(500_000_000).nullable().optional(),
  tarifa: z.string().trim().max(80).optional(),
  instagram: z.string().trim().max(120).optional(),
  tiktok: z.string().trim().max(120).optional(),
  notas: z.string().trim().max(600).optional(),
});

/** Completa la ficha de un creador desde el panel (protegido por la cookie admin). */
export async function POST(request: Request) {
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
  const { id, ...campos } = parsed.data;
  try {
    await updateCreador(id, campos);
  } catch (err) {
    console.error("updateCreador:", err);
    const msg = err instanceof Error ? err.message : "No se pudo guardar.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
