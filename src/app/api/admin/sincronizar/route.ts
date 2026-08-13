import { NextResponse } from "next/server";
import { analisisParaOS, inteligenciaNichos, listLeads } from "@/lib/admin";
import { listCreadores } from "@/lib/creadores";
import { enviarAlOS, hasOS } from "@/lib/bushido-os";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Manda al cerebro TODA la data que el sitio ha acumulado, para que la cruce
 * con lo que ya sabe de otros nichos.
 *
 * Va en bloques separados para que el OS los procese por su cuenta y para que,
 * si uno falla, los demás sigan.
 */
export async function POST() {
  if (!hasOS()) {
    return NextResponse.json(
      { ok: false, error: "Falta BUSHIDO_OS_URL o SITIO_WEB_SECRET en Vercel." },
      { status: 503 }
    );
  }

  const reporte: Record<string, unknown> = {};

  // 1. Book de creadores: quiénes son, su nicho, formato y audiencia
  try {
    const creadores = await listCreadores({ limit: 500 });
    const r = await enviarAlOS("/api/sync", {
      tipo: "creadores",
      total: creadores.length,
      items: creadores.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        ciudad: c.ciudad,
        instagram: c.instagram,
        tiktok: c.tiktok,
        nichos: c.nichos,
        formatos: c.formatos,
        seguidores: c.seguidores,
        tarifa: c.tarifa,
        estado: c.estado,
        notas: c.notas,
      })),
    });
    reporte.creadores = { enviados: creadores.length, ...r };
  } catch (e) {
    reporte.creadores = { ok: false, error: e instanceof Error ? e.message : "error" };
  }

  // 2. Análisis completos: el diagnóstico crudo de cada marca
  try {
    const analisis = await analisisParaOS(500);
    const r = await enviarAlOS("/api/sync", {
      tipo: "analisis",
      total: analisis.length,
      items: analisis,
    });
    reporte.analisis = { enviados: analisis.length, ...r };
  } catch (e) {
    reporte.analisis = { ok: false, error: e instanceof Error ? e.message : "error" };
  }

  // 3. Inteligencia ya agregada por nicho (patrones, emociones, canales flojos)
  try {
    const nichos = await inteligenciaNichos();
    const r = await enviarAlOS("/api/sync", {
      tipo: "nichos",
      total: nichos.length,
      items: nichos,
    });
    reporte.nichos = { enviados: nichos.length, ...r };
  } catch (e) {
    reporte.nichos = { ok: false, error: e instanceof Error ? e.message : "error" };
  }

  // 4. Leads: la demanda real (qué piden y de qué sector)
  try {
    const leads = await listLeads(500);
    const r = await enviarAlOS("/api/sync", {
      tipo: "leads",
      total: leads.length,
      items: leads.map((l) => ({
        id: l.id,
        created_at: l.created_at,
        kind: l.kind,
        empresa: l.company,
        redes: l.social,
        proyecto: l.project,
        mensaje: l.message,
        estado: l.status,
      })),
    });
    reporte.leads = { enviados: leads.length, ...r };
  } catch (e) {
    reporte.leads = { ok: false, error: e instanceof Error ? e.message : "error" };
  }

  const todoOk = Object.values(reporte).every(
    (r) => (r as { ok?: boolean })?.ok !== false
  );
  return NextResponse.json({ ok: todoOk, reporte });
}
