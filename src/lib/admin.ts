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

// ───────────────────────── Inteligencia por nicho ─────────────────────────
// Agrega los análisis gratis para responder: en tal nicho, ¿qué tienen bien
// resuelto las marcas y qué les falta siempre? Es la data propia de Bushido.

export interface Frase {
  texto: string;
  marca: string;
}
export interface NichoIntel {
  categoria: string;
  total: number;
  marcas: string[];
  temasFortaleza: Array<{ name: string; count: number }>;
  temasCarencia: Array<{ name: string; count: number }>;
  emociones: Array<{ name: string; count: number }>;
  canalesFlojos: Array<{ name: string; count: number }>;
  fortalezas: Frase[];
  carencias: Frase[];
  oportunidades: Frase[];
}

const STOP = new Set(
  ("para pero como mas muy hay sin con los las del que una uno unos unas este esta estos estas " +
    "sus por son tiene tienen esta estan sobre entre cuando donde todo toda todos todas nada algo " +
    "ser hacer puede pueden solo sino aunque desde hasta cada otro otra ademas porque tambien " +
    "marca cliente clientes contenido publica publicar hace")
    .split(" ")
);

/**
 * Temas que se repiten en VARIAS marcas del nicho → el patrón real.
 * Cuenta marcas distintas (no repeticiones) y prefiere pares de palabras
 * ("sitio web") sobre palabras sueltas ("sitio"), que se leen mucho mejor.
 */
function temas(frases: Frase[], min = 2) {
  const porTema: Record<string, Set<string>> = {};
  for (const f of frases) {
    const tokens = f.texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 3 && !STOP.has(w));

    // palabras largas sueltas + todos los pares consecutivos
    const vistos = new Set<string>();
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].length > 4) vistos.add(tokens[i]);
      if (i + 1 < tokens.length) vistos.add(`${tokens[i]} ${tokens[i + 1]}`);
    }
    for (const t of vistos) (porTema[t] ??= new Set()).add(f.marca);
  }

  const todos = Object.entries(porTema)
    .map(([name, set]) => ({ name, count: set.size }))
    .filter((t) => t.count >= min)
    .sort((a, b) => b.count - a.count || b.name.length - a.name.length);

  // descarta la palabra suelta si un par igual de frecuente ya la contiene
  const pares = todos.filter((t) => t.name.includes(" "));
  return todos
    .filter(
      (t) =>
        t.name.includes(" ") ||
        !pares.some((p) => p.count >= t.count && p.name.split(" ").includes(t.name))
    )
    .slice(0, 7);
}

function contar(valores: string[]) {
  const c: Record<string, number> = {};
  for (const v of valores) c[v] = (c[v] ?? 0) + 1;
  return Object.entries(c)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

type CanalRow = { canal?: string; estado?: string };

/**
 * Los análisis completos, para mandárselos al cerebro (Bushido OS) y que los
 * cruce con lo que ya sabe de otros nichos.
 */
export async function analisisParaOS(limite = 500): Promise<Array<Record<string, unknown>>> {
  const COLS =
    "id, created_at, marca, nicho, categoria, resumen, fortalezas, carencias, " +
    "oportunidades, buyer_persona, emociones, emociones_detalle, canales, metricas, propuesta, paquete, estado";
  if (hasDb()) {
    const { data, error } = await db()
      .from("analisis")
      .select(COLS)
      .order("created_at", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Array<Record<string, unknown>>;
  }
  return (await readLocal<Record<string, unknown>>("analisis.json")).slice(0, limite);
}

/** Agrupa TODOS los análisis por categoría de nicho. */
export async function inteligenciaNichos(): Promise<NichoIntel[]> {
  const COLS =
    "marca, nicho, categoria, fortalezas, carencias, oportunidades, emociones, canales";
  let filas: Array<Record<string, unknown>> = [];

  if (hasDb()) {
    const { data, error } = await db().from("analisis").select(COLS).limit(1000);
    if (error) throw new Error(error.message);
    filas = (data ?? []) as Array<Record<string, unknown>>;
  } else {
    filas = await readLocal("analisis.json");
  }

  const grupos: Record<string, Array<Record<string, unknown>>> = {};
  for (const f of filas) {
    const cat = (f.categoria as string) || (f.nicho as string) || "Sin clasificar";
    (grupos[cat] ??= []).push(f);
  }

  const lista = (f: Record<string, unknown>, campo: string): string[] => {
    const v = f[campo];
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
    return [];
  };

  return Object.entries(grupos)
    .map(([categoria, rows]) => {
      const frases = (campo: string): Frase[] =>
        rows.flatMap((r) =>
          lista(r, campo).map((texto) => ({ texto, marca: (r.marca as string) || "—" }))
        );

      const fortalezas = frases("fortalezas");
      const carencias = frases("carencias");
      const oportunidades = frases("oportunidades");

      const emociones = contar(rows.flatMap((r) => lista(r, "emociones")));

      // canales con problema = oportunidad de venta directa
      const flojos: string[] = [];
      for (const r of rows) {
        const cs = Array.isArray(r.canales) ? (r.canales as CanalRow[]) : [];
        for (const c of cs) {
          if (!c?.canal || !c.estado) continue;
          if (["ausente", "débil", "debil", "irregular"].includes(c.estado)) {
            flojos.push(`${c.canal} · ${c.estado}`);
          }
        }
      }

      return {
        categoria,
        total: rows.length,
        marcas: rows.map((r) => (r.marca as string) || "—"),
        temasFortaleza: temas(fortalezas),
        temasCarencia: temas(carencias),
        emociones: emociones.slice(0, 8),
        canalesFlojos: contar(flojos).slice(0, 6),
        fortalezas,
        carencias,
        oportunidades,
      };
    })
    .sort((a, b) => b.total - a.total);
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
