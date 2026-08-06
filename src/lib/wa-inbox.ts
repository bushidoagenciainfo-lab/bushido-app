// Bandeja de WhatsApp: guardar y leer las conversaciones.
// El número vive en la Cloud API de Meta, así que no se puede abrir en la app
// del celular — esta es la forma de ver y responder lo que contesta la gente.

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

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

export interface WaMensaje {
  id?: string;
  created_at?: string;
  wa_id: string;
  nombre?: string | null;
  direccion: "entrante" | "saliente";
  texto?: string | null;
  tipo?: string;
  message_id?: string | null;
  leido?: boolean;
}

export interface WaConversacion {
  wa_id: string;
  nombre?: string | null;
  ultimo: string; // texto del último mensaje
  fecha: string;
  sinLeer: number;
  /** La ventana de 24h de Meta: fuera de ella solo se puede mandar plantilla. */
  ventanaAbierta: boolean;
  minutosRestantes: number;
}

async function archivo(): Promise<string | null> {
  for (const dir of [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      return path.join(dir, "wa_mensajes.json");
    } catch {
      /* siguiente */
    }
  }
  return null;
}
async function leerLocal(): Promise<WaMensaje[]> {
  const f = await archivo();
  if (!f) return [];
  try {
    return JSON.parse(await fs.readFile(f, "utf8")) as WaMensaje[];
  } catch {
    return [];
  }
}
async function escribirLocal(todos: WaMensaje[]): Promise<void> {
  const f = await archivo();
  if (f) await fs.writeFile(f, JSON.stringify(todos, null, 2), "utf8");
}

/** Guarda un mensaje. Ignora duplicados por message_id (Meta reintenta webhooks). */
export async function guardarMensaje(m: WaMensaje): Promise<void> {
  if (hasDb()) {
    const { error } = await db()
      .from("wa_mensajes")
      .upsert(
        {
          wa_id: m.wa_id,
          nombre: m.nombre ?? null,
          direccion: m.direccion,
          texto: m.texto ?? null,
          tipo: m.tipo ?? "text",
          message_id: m.message_id ?? null,
          leido: m.direccion === "saliente",
        },
        { onConflict: "message_id", ignoreDuplicates: true }
      );
    if (error) throw new Error(error.message);
    return;
  }
  const todos = await leerLocal();
  if (m.message_id && todos.some((x) => x.message_id === m.message_id)) return;
  todos.push({
    ...m,
    id: globalThis.crypto?.randomUUID?.(),
    created_at: new Date().toISOString(),
    leido: m.direccion === "saliente",
  });
  await escribirLocal(todos);
}

/** Una fila por contacto, ordenadas por lo más reciente. */
export async function listConversaciones(limite = 60): Promise<WaConversacion[]> {
  let todos: WaMensaje[];
  if (hasDb()) {
    const { data, error } = await db()
      .from("wa_mensajes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    todos = (data ?? []) as WaMensaje[];
  } else {
    todos = (await leerLocal()).sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? "")
    );
  }

  const porContacto = new Map<string, WaMensaje[]>();
  for (const m of todos) {
    const arr = porContacto.get(m.wa_id) ?? [];
    arr.push(m);
    porContacto.set(m.wa_id, arr);
  }

  const ahora = Date.now();
  const out: WaConversacion[] = [];
  for (const [wa_id, msgs] of porContacto) {
    const ultimo = msgs[0];
    const ultimoEntrante = msgs.find((m) => m.direccion === "entrante");
    const desde = ultimoEntrante?.created_at ? new Date(ultimoEntrante.created_at).getTime() : 0;
    const restan = desde ? 24 * 60 - Math.floor((ahora - desde) / 60000) : 0;
    out.push({
      wa_id,
      nombre: msgs.find((m) => m.nombre)?.nombre ?? null,
      ultimo: ultimo?.texto ?? `(${ultimo?.tipo ?? "mensaje"})`,
      fecha: ultimo?.created_at ?? "",
      sinLeer: msgs.filter((m) => m.direccion === "entrante" && !m.leido).length,
      ventanaAbierta: restan > 0,
      minutosRestantes: Math.max(0, restan),
    });
  }
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, limite);
}

/** Los mensajes de un contacto, del más viejo al más nuevo (como un chat). */
export async function listMensajes(wa_id: string, limite = 200): Promise<WaMensaje[]> {
  if (hasDb()) {
    const { data, error } = await db()
      .from("wa_mensajes")
      .select("*")
      .eq("wa_id", wa_id)
      .order("created_at", { ascending: true })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data ?? []) as WaMensaje[];
  }
  return (await leerLocal())
    .filter((m) => m.wa_id === wa_id)
    .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
    .slice(-limite);
}

/** Marca como leídos los mensajes de un contacto. */
export async function marcarLeidos(wa_id: string): Promise<void> {
  if (hasDb()) {
    await db().from("wa_mensajes").update({ leido: true }).eq("wa_id", wa_id).eq("leido", false);
    return;
  }
  const todos = await leerLocal();
  for (const m of todos) if (m.wa_id === wa_id) m.leido = true;
  await escribirLocal(todos);
}

/** Cuántos mensajes sin leer hay en total (para el contador del panel). */
export async function totalSinLeer(): Promise<number> {
  if (hasDb()) {
    const { count } = await db()
      .from("wa_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("direccion", "entrante")
      .eq("leido", false);
    return count ?? 0;
  }
  return (await leerLocal()).filter((m) => m.direccion === "entrante" && !m.leido).length;
}
