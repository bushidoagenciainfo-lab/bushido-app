// Funciones de datos del panel admin (solo servidor, service role → salta RLS).
// Con Supabase configurado lee de la BD; sin ella, del almacén local .data/*.json
// (para pruebas locales).

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { LEAD_STATUSES, type LeadRow } from "./admin-types";

export { LEAD_STATUSES };
export type { LeadRow };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasDb(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
function db() {
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false },
  });
}

async function readLocal<T>(file: string): Promise<T[]> {
  for (const dir of [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")]) {
    try {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : Object.values(parsed);
    } catch {
      /* siguiente */
    }
  }
  return [];
}

/** Últimos leads (para la tabla del admin). */
export async function listLeads(limit = 100): Promise<LeadRow[]> {
  if (hasDb()) {
    const { data, error } = await db()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as LeadRow[];
  }
  const local = await readLocal<LeadRow>("leads.json");
  return local
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, limit);
}

/** Últimos análisis generados. */
export async function listAnalisis(limit = 100): Promise<Array<Record<string, unknown>>> {
  if (hasDb()) {
    const { data, error } = await db()
      .from("analisis")
      .select("id, created_at, marca, nicho, categoria, estado, lead_id")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  return readLocal("analisis.json");
}

/** Cambia el estado de un lead. */
export async function setLeadStatus(id: string, status: string): Promise<void> {
  if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
    throw new Error("Estado inválido.");
  }
  if (hasDb()) {
    const { error } = await db().from("leads").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  // local: reescribe el json
  const dir = [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")].find(Boolean)!;
  try {
    const file = path.join(dir, "leads.json");
    const all = JSON.parse(await fs.readFile(file, "utf8")) as LeadRow[];
    const row = all.find((l) => l.id === id);
    if (row) row.status = status;
    await fs.writeFile(file, JSON.stringify(all, null, 2), "utf8");
  } catch {
    /* dev best-effort */
  }
}

export interface DashboardStats {
  leadsTotal: number;
  porEstado: Record<string, number>;
  porTipo: Record<string, number>;
  analisisTotal: number;
  topServicios: Array<{ name: string; count: number }>;
  topCtas: Array<{ name: string; count: number }>;
  topPaginas: Array<{ name: string; count: number }>;
  eventosTotal: number;
}

function tally(rows: Array<Record<string, unknown>>, key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = (r[key] as string) || "—";
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}
function topBy(
  rows: Array<{ type?: string; name?: string; path?: string }>,
  type: string,
  field: "name" | "path"
) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    if (r.type !== type) continue;
    const v = (r[field] as string) || "—";
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/** KPIs + analítica de interés para el dashboard. */
export async function dashboardStats(): Promise<DashboardStats> {
  let leads: Array<Record<string, unknown>> = [];
  let analisisCount = 0;
  let events: Array<{ type?: string; name?: string; path?: string }> = [];

  if (hasDb()) {
    const c = db();
    const [lq, aq, eq] = await Promise.all([
      c.from("leads").select("kind, status"),
      c.from("analisis").select("id", { count: "exact", head: true }),
      c.from("events").select("type, name, path").limit(5000),
    ]);
    leads = (lq.data as Array<Record<string, unknown>>) ?? [];
    analisisCount = aq.count ?? 0;
    events = (eq.data as typeof events) ?? [];
  } else {
    leads = await readLocal("leads.json");
    analisisCount = (await readLocal("analisis.json")).length;
    events = await readLocal("events.json");
  }

  return {
    leadsTotal: leads.length,
    porEstado: tally(leads, "status"),
    porTipo: tally(leads, "kind"),
    analisisTotal: analisisCount,
    eventosTotal: events.length,
    topServicios: topBy(events, "servicio", "name"),
    topCtas: topBy(events, "cta", "name"),
    topPaginas: topBy(events, "pageview", "path"),
  };
}
