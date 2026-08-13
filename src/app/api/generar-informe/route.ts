import { NextResponse, after } from "next/server";
import { z } from "zod";
import { generarAnalisis, hasIA } from "@/lib/analizar";
import { storeAnalisis, informeUrl, emailInformeListo } from "@/lib/analisis-store";
import { marcarInforme } from "@/lib/leads";
import { enviarAlOS } from "@/lib/bushido-os";
import { sendClientWhatsApp } from "@/lib/whatsapp";
import { forwardToServer } from "@/lib/forward";

export const runtime = "nodejs";
// Esta ruta existe SOLO para el análisis pesado: así tiene su propio presupuesto
// de tiempo completo, en vez de compartirlo con el guardado del lead y los avisos
// (la búsqueda web sola tarda ~35s y hacía que /api/lead se pasara del límite).
export const maxDuration = 60;

const schema = z.object({
  secret: z.string(),
  marca: z.string().trim().min(1).max(160),
  redes: z.string().trim().max(300).nullish(),
  tiktok: z.string().trim().max(300).nullish(),
  web: z.string().trim().max(300).nullish(),
  contexto: z.string().trim().max(2000).nullish(),
  leadId: z.string().trim().max(80).nullish(),
  email: z.string().trim().max(160).nullish(),
  nombre: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
});

/** Genera el informe y lo envía (correo + WhatsApp). Interna: pide INTERNAL_SECRET. */
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
  const d = parsed.data;

  // Secreto compartido: evita que alguien de fuera dispare análisis (cuestan dinero).
  const expected = process.env.INTERNAL_SECRET || process.env.ANALIZAR_SECRET;
  if (!expected || d.secret !== expected) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  if (!hasIA()) {
    return NextResponse.json({ ok: false, error: "Sin ANTHROPIC_API_KEY." }, { status: 503 });
  }

  // Respondemos YA y hacemos el trabajo pesado después, con los 60s completos.
  after(async () => {
    const t0 = Date.now();
    try {
      const analisis = await generarAnalisis({
        marca: d.marca,
        redes: d.redes ?? undefined,
        tiktok: d.tiktok ?? undefined,
        web: d.web ?? undefined,
        contexto: d.contexto ?? undefined,
      });
      if (!analisis) {
        console.error("[informe] generarAnalisis devolvió null");
        if (d.leadId) await marcarInforme(d.leadId, { ok: false, error: "La IA no devolvió resultado." });
        return;
      }
      const id = await storeAnalisis(analisis, d.leadId ?? undefined);
      const url = informeUrl(id);
      forwardToServer("analisis", { leadId: d.leadId, ...analisis }).catch(() => {});
      // al cerebro, para que lo cruce con los demás nichos (no bloquea)
      enviarAlOS("/api/sync", {
        tipo: "analisis",
        total: 1,
        items: [{ id, lead_id: d.leadId, ...analisis }],
      }).catch(() => {});

      if (d.email) {
        await emailInformeListo({
          email: d.email,
          nombre: d.nombre ?? undefined,
          marca: analisis.marca,
          url,
        }).catch((e) => console.error("[informe] email falló:", e));
      }
      await sendClientWhatsApp({
        phone: d.phone ?? undefined,
        params: [(d.nombre || "").split(" ")[0] || "hola", analisis.marca, url],
      });
      if (d.leadId) await marcarInforme(d.leadId, { ok: true, url });
      console.log(`[informe] LISTO en ${Date.now() - t0}ms · ${url}`);
    } catch (e) {
      console.error("[informe] error:", e);
      if (d.leadId) {
        await marcarInforme(d.leadId, {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
  });

  return NextResponse.json({ ok: true, queued: true });
}
