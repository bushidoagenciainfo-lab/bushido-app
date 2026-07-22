// Persistencia de los análisis (7 maletas) — la BASE DE DATOS de Bushido.
// Cada análisis alimenta el dataset propio (nicho, fortalezas, carencias,
// emociones). Usa Supabase cuando está configurado; si no, un JSON local (dev).
// Ver esquema en supabase/analisis.sql (tabla `analisis`).

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Analisis } from "./analisis";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_FROM_EMAIL =
  process.env.LEAD_FROM_EMAIL || "Bushido <onboarding@resend.dev>";
const SITE_URL = process.env.SITE_URL || "https://bushidoav.com";

function hasDb(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function db() {
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false },
  });
}

// mapea el `Analisis` (camelCase, del front) a las columnas de la tabla (snake_case)
function toRow(a: Analisis, leadId?: string) {
  return {
    lead_id: leadId ?? null,
    marca: a.marca,
    nicho: a.nicho ?? null,
    redes: a.redes ?? null,
    web: a.web ?? null,
    resumen: a.resumen ?? null,
    fortalezas: a.fortalezas ?? null,
    carencias: a.carencias ?? null,
    oportunidades: a.oportunidades ?? null,
    buyer_persona: a.buyerPersona ?? null,
    maletas: a.maletas ?? null,
    emociones: a.emociones ?? null,
    propuesta: a.propuesta ?? null,
    paquete: a.paquete ?? null,
    estado: a.estado ?? "analizado",
  };
}

// mapea una fila de la tabla de vuelta al `Analisis` que consume ReportView
function fromRow(r: Record<string, unknown>): Analisis {
  return {
    marca: (r.marca as string) ?? "",
    nicho: (r.nicho as string) ?? "",
    redes: (r.redes as string) ?? undefined,
    web: (r.web as string) ?? undefined,
    fecha: r.created_at ? new Date(r.created_at as string).getFullYear().toString() : "",
    resumen: (r.resumen as string) ?? "",
    fortalezas: (r.fortalezas as string[]) ?? [],
    carencias: (r.carencias as string[]) ?? [],
    oportunidades: (r.oportunidades as string[]) ?? [],
    buyerPersona: (r.buyer_persona as Analisis["buyerPersona"]) ?? {
      nombre: "",
      descripcion: "",
      jtbd: [],
    },
    maletas: (r.maletas as Analisis["maletas"]) ?? [],
    emociones: (r.emociones as Analisis["emociones"]) ?? [],
    propuesta: (r.propuesta as string) ?? "",
    paquete: (r.paquete as Analisis["paquete"]) ?? { nombre: "", precio: "", porque: "" },
    estado: (r.estado as Analisis["estado"]) ?? "analizado",
  };
}

// ── almacén local (dev / sin Supabase) ──
async function localDir(): Promise<string | null> {
  for (const dir of [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      return dir;
    } catch {
      /* intenta el siguiente */
    }
  }
  return null;
}

/** Guarda el análisis y devuelve su id (para el link /informe/[id]). */
export async function storeAnalisis(a: Analisis, leadId?: string): Promise<string> {
  if (hasDb()) {
    const { data, error } = await db().from("analisis").insert(toRow(a, leadId)).select("id").single();
    if (error) throw new Error(`Supabase insert (analisis) falló: ${error.message}`);
    return data.id as string;
  }
  // fallback local
  const id = (globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`);
  const dir = await localDir();
  if (dir) {
    const file = path.join(dir, "analisis.json");
    let all: Record<string, unknown> = {};
    try {
      all = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      all = {};
    }
    all[id] = { ...toRow(a, leadId), id, created_at: new Date().toISOString() };
    await fs.writeFile(file, JSON.stringify(all, null, 2), "utf8");
  }
  return id;
}

/** Lee un análisis por id. Devuelve null si no existe. */
export async function getAnalisis(id: string): Promise<Analisis | null> {
  if (hasDb()) {
    const { data, error } = await db().from("analisis").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return fromRow(data as Record<string, unknown>);
  }
  const dir = await localDir();
  if (!dir) return null;
  try {
    const all = JSON.parse(await fs.readFile(path.join(dir, "analisis.json"), "utf8"));
    const row = all[id];
    return row ? fromRow(row) : null;
  } catch {
    return null;
  }
}

/** URL pública del informe. */
export function informeUrl(id: string): string {
  return `${SITE_URL.replace(/\/$/, "")}/informe/${id}`;
}

/** Envía al cliente el link de su informe. No-op si no hay Resend/email. */
export async function emailInformeListo(opts: {
  email: string;
  nombre?: string;
  marca: string;
  url: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[informe] email omitido (sin RESEND_API_KEY). Link: ${opts.url}`);
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  const nombre = (opts.nombre || "").split(" ")[0] || "";
  const html = `
    <div style="background:#0A0A0B;padding:30px">
      <div style="max-width:560px;margin:0 auto;background:#EDE7DA;border-radius:10px;overflow:hidden">
        <div style="background:#D5322E;color:#EDE7DA;padding:16px 24px;font:700 16px Helvetica;letter-spacing:2px">
          BUSH<span style="color:#0A0A0B">I</span>DO
        </div>
        <div style="padding:28px 24px">
          <p style="margin:0 0 16px;color:#0A0A0B;font:400 26px Georgia,serif">Hola ${nombre}, tu análisis de <b>${opts.marca}</b> está listo.</p>
          <p style="margin:0 0 22px;color:#514E4A;font:14px/1.6 Helvetica,Arial">
            Analizamos tu marca con nuestro método de las 7 maletas: qué te compran, qué emociones lo mueven y qué contenido lo capitaliza.
          </p>
          <a href="${opts.url}" style="display:inline-block;background:#0A0A0B;color:#EDE7DA;text-decoration:none;padding:14px 26px;border-radius:999px;font:600 13px Helvetica;letter-spacing:1px">Ver mi análisis →</a>
          <p style="margin:22px 0 0;color:#8A8784;font:11px monospace;letter-spacing:1px">Criterio antes que equipo · bushidoav.com</p>
        </div>
      </div>
    </div>`;
  await resend.emails.send({
    from: LEAD_FROM_EMAIL,
    to: opts.email,
    subject: `Tu análisis de ${opts.marca} está listo · Bushido`,
    html,
  });
}
