// Guardado de eventos de interés (analítica propia). Supabase o .data local.
// Nunca lanza: la analítica jamás debe romper la experiencia del sitio.

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface EventInput {
  type: string;
  name?: string;
  path?: string;
  ref?: string;
  meta?: Record<string, unknown>;
}

export async function storeEvent(e: EventInput): Promise<void> {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      await supabase.from("events").insert({
        type: e.type,
        name: e.name ?? null,
        path: e.path ?? null,
        ref: e.ref ?? null,
        meta: e.meta ?? null,
      });
    } catch (err) {
      console.error("[track] insert falló:", err);
    }
    return;
  }
  // local (dev)
  const record = { ...e, created_at: new Date().toISOString() };
  for (const dir of [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, "events.json");
      let all: unknown[] = [];
      try {
        all = JSON.parse(await fs.readFile(file, "utf8"));
      } catch {
        all = [];
      }
      all.push(record);
      await fs.writeFile(file, JSON.stringify(all, null, 2), "utf8");
      return;
    } catch {
      /* siguiente */
    }
  }
}
