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
  }
}
