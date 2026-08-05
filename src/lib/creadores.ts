// Book de creadores UGC / influencers: registro, almacenamiento y consulta.
// Es el banco propio de Bushido para armar castings por nicho y formato —
// distinto del banco de crew audiovisual (leads kind 'talento').

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

// La taxonomía vive aparte (creadores-taxonomia.ts) para que los componentes
// cliente puedan importarla sin arrastrar node:fs/supabase.
export { NICHOS_CREADOR, FORMATOS_CREADOR } from "./creadores-taxonomia";
export type { NichoCreador, FormatoCreador } from "./creadores-taxonomia";

export interface CreadorInput {
  nombre: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  nichos?: string[];
  formatos?: string[];
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  seguidores?: number;
  tarifa?: string;
  notas?: string;
  portafolio?: string;
}

export interface CreadorRow extends CreadorInput {
  id: string;
  created_at: string;
  estado: string;
  rating?: number;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasDb(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
function db() {
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false },
  });
}

async function localFile(): Promise<string | null> {
  for (const dir of [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      return path.join(dir, "creadores.json");
    } catch {
      /* siguiente */
    }
  }
  return null;
}

/** Registra un creador en el book. */
export async function storeCreador(c: CreadorInput): Promise<void> {
  if (hasDb()) {
    const { error } = await db().from("creadores").insert({
      nombre: c.nombre,
      email: c.email ?? null,
      telefono: c.telefono ?? null,
      ciudad: c.ciudad ?? null,
      nichos: c.nichos ?? null,
      formatos: c.formatos ?? null,
      instagram: c.instagram ?? null,
      tiktok: c.tiktok ?? null,
      youtube: c.youtube ?? null,
      seguidores: c.seguidores ?? null,
      tarifa: c.tarifa ?? null,
      notas: c.notas ?? null,
      portafolio: c.portafolio ?? null,
    });
    if (error) throw new Error(`Supabase insert (creadores) falló: ${error.message}`);
    return;
  }
  const file = await localFile();
  if (!file) return;
  let all: unknown[] = [];
  try {
    all = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    all = [];
  }
  all.push({ id: globalThis.crypto?.randomUUID?.(), ...c, estado: "nuevo", created_at: new Date().toISOString() });
  await fs.writeFile(file, JSON.stringify(all, null, 2), "utf8");
}

/** Lista el book, con filtros opcionales por nicho y formato (para el casting). */
export async function listCreadores(opts?: {
  nicho?: string;
  formato?: string;
  limit?: number;
}): Promise<CreadorRow[]> {
  const limit = opts?.limit ?? 200;
  if (hasDb()) {
    let q = db().from("creadores").select("*").order("created_at", { ascending: false }).limit(limit);
    if (opts?.nicho) q = q.contains("nichos", [opts.nicho]);
    if (opts?.formato) q = q.contains("formatos", [opts.formato]);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as CreadorRow[];
  }
  const file = await localFile();
  if (!file) return [];
  try {
    const all = JSON.parse(await fs.readFile(file, "utf8")) as CreadorRow[];
    return all
      .filter((c) => (opts?.nicho ? c.nichos?.includes(opts.nicho) : true))
      .filter((c) => (opts?.formato ? c.formatos?.includes(opts.formato) : true))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** Cambia el estado de un creador (nuevo|aprobado|destacado|pausado). */
export async function setCreadorEstado(id: string, estado: string): Promise<void> {
  if (!["nuevo", "aprobado", "destacado", "pausado"].includes(estado)) {
    throw new Error("Estado inválido.");
  }
  if (hasDb()) {
    const { error } = await db().from("creadores").update({ estado }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await updateLocal(id, { estado } as Partial<CreadorRow>);
}

/**
 * Campos que se pueden completar a mano desde el panel.
 * `seguidores` admite null para poder BORRAR un dato mal puesto.
 */
export type CreadorEdit = Partial<
  Pick<CreadorInput, "nichos" | "formatos" | "tarifa" | "instagram" | "tiktok" | "notas">
> & { seguidores?: number | null };

/**
 * Completa la ficha de un creador. Es lo que convierte la lista de contactos
 * importada del documento en data utilizable para castings.
 */
export async function updateCreador(id: string, campos: CreadorEdit): Promise<void> {
  const limpio: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(campos)) {
    if (v === undefined) continue;
    limpio[k] = v === "" ? null : v;
  }
  if (!Object.keys(limpio).length) return;

  if (hasDb()) {
    const { error } = await db().from("creadores").update(limpio).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await updateLocal(id, limpio as Partial<CreadorRow>);
}

/** Igual pero contra el archivo local (dev). */
async function updateLocal(id: string, campos: Partial<CreadorRow>): Promise<void> {
  const file = await localFile();
  if (!file) return;
  try {
    const all = JSON.parse(await fs.readFile(file, "utf8")) as CreadorRow[];
    const row = all.find((c) => c.id === id);
    if (!row) return;
    Object.assign(row, campos);
    await fs.writeFile(file, JSON.stringify(all, null, 2), "utf8");
  } catch {
    /* dev best-effort */
  }
}

/** Qué tan usable está el book: sin esto es una agenda, no data. */
export interface SaludBook {
  total: number;
  conNicho: number;
  conFormato: number;
  conSeguidores: number;
  conContacto: number;
  completas: number;
}
export function saludBook(rows: CreadorRow[]): SaludBook {
  const tiene = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v));
  return {
    total: rows.length,
    conNicho: rows.filter((c) => tiene(c.nichos)).length,
    conFormato: rows.filter((c) => tiene(c.formatos)).length,
    conSeguidores: rows.filter((c) => tiene(c.seguidores)).length,
    conContacto: rows.filter((c) => tiene(c.telefono) || tiene(c.email)).length,
    // "completa" = sirve para un casting: nicho + formato + tamaño de audiencia
    completas: rows.filter(
      (c) => tiene(c.nichos) && tiene(c.formatos) && tiene(c.seguidores)
    ).length,
  };
}
