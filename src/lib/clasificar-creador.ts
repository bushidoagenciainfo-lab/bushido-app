// Deduce nicho y formatos de un creador a partir de datos REALES de su perfil
// (biografía + últimas publicaciones que devuelve Business Discovery).
// No adivina desde el @usuario: si no hay material suficiente, devuelve null.

import Anthropic from "@anthropic-ai/sdk";
import { NICHOS_CREADOR, FORMATOS_CREADOR } from "./creadores-taxonomia";
import type { IgPerfil } from "./instagram";

const KEY = process.env.ANTHROPIC_API_KEY;

export interface Sugerencia {
  nichos: string[];
  formatos: string[];
  resumen: string;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    nichos: {
      type: "array",
      items: { type: "string", enum: [...NICHOS_CREADOR] },
      description: "1 o 2 nichos de la lista. El principal primero.",
    },
    formatos: {
      type: "array",
      items: { type: "string", enum: [...FORMATOS_CREADOR] },
      description: "1 a 3 formatos que se le ven en el contenido.",
    },
    resumen: {
      type: "string",
      description: "Una línea sobre qué hace y para qué marca serviría. Máx 140 caracteres.",
    },
  },
  required: ["nichos", "formatos", "resumen"],
} as const;

/**
 * Clasifica un perfil. Devuelve null si no hay señal suficiente (perfil sin
 * biografía ni publicaciones) — preferimos vacío antes que un dato inventado.
 */
export async function clasificarCreador(perfil: IgPerfil): Promise<Sugerencia | null> {
  if (!KEY) return null;

  const captions = (perfil.media ?? [])
    .map((m) => m.caption?.trim())
    .filter(Boolean)
    .slice(0, 6);

  // sin bio y sin publicaciones no hay nada que leer
  if (!perfil.biography?.trim() && captions.length === 0) return null;

  const client = new Anthropic({ apiKey: KEY });
  const userMsg = [
    `Usuario: @${perfil.username}`,
    perfil.name ? `Nombre: ${perfil.name}` : "",
    perfil.biography ? `Biografía: ${perfil.biography}` : "",
    perfil.followers_count ? `Seguidores: ${perfil.followers_count}` : "",
    captions.length ? `\nÚltimas publicaciones:\n- ${captions.join("\n- ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 1000,
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "low" },
      system:
        "Clasificas creadores de contenido para el book de castings de una agencia audiovisual colombiana. " +
        "Te dan datos REALES del perfil (biografía y publicaciones). Elige el nicho y los formatos que se " +
        "sostienen con esa evidencia; si algo no se puede saber, no lo fuerces. Español colombiano, sin adornos.",
      messages: [{ role: "user", content: userMsg }],
    },
    { timeout: 20000, maxRetries: 0 }
  );

  const bloque = res.content.find((c) => c.type === "text");
  if (!bloque || bloque.type !== "text") return null;
  try {
    return JSON.parse(bloque.text) as Sugerencia;
  } catch {
    return null;
  }
}
