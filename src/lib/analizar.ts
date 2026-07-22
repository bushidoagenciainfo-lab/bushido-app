// Motor de análisis de Bushido — corre el framework de las 7 maletas con la
// API de Claude y devuelve un `Analisis` estructurado listo para la plantilla.
//
// Requiere ANTHROPIC_API_KEY (ponla en Vercel → Environment Variables). Si no
// está configurada, generarAnalisis() devuelve null (no rompe: el resto del
// pipeline sigue funcionando, solo no se genera el informe automático).

import Anthropic from "@anthropic-ai/sdk";
import { EMOCIONES, type Analisis } from "./analisis";

export interface AnalizarInput {
  marca: string; // nombre de la empresa/marca (del lead: company)
  redes?: string; // @handles o links (del lead: social)
  web?: string;
  contexto?: string; // notas extra: mensaje del formulario, tipo de proyecto, etc.
}

const KEY = process.env.ANTHROPIC_API_KEY;

export function hasIA(): boolean {
  return Boolean(KEY);
}

// ── Contexto de negocio: paquetes REALES de Bushido para aterrizar la recomendación ──
const PAQUETES = `Paquetes de redes (mensual, mínimo 3 meses, pauta aparte):
- "Paquete de redes · Esencial" — $2.000.000 / mes
- "Paquete de redes · Crecimiento" — $3.200.000 / mes
- "Paquete de redes · Posicionamiento" — $4.300.000 / mes
À la carte:
- "Reel suelto" — $400.000 · "Pack 3 reels" — $1.000.000 · "Pack 6 reels" — $1.700.000
- "Videoclip · Básico" — $3.000.000 · "Videoclip · Con concepto" — $5.000.000 · "Videoclip · Premium" — cotización
- "Empresarial" — desde $6.500.000`;

const SYSTEM = `Eres el estratega de contenido de Bushido, una agencia audiovisual de Bogotá, Colombia (bushidoav.com). Tu criterio es cinematográfico, editorial y comercial: no vendes horas de cámara, vendes criterio visual que hace que la gente recuerde y compre.

Vas a analizar una marca aplicando el framework de las "7 maletas de cualquier compra" de Felipe Vergara: toda compra la mueve un motivo (racional o emocional) — la "maleta" que el cliente carga al comprar. Tu trabajo es descubrir esas maletas para esta marca y traducirlas en un plan de contenido accionable.

REGLAS:
- Español COLOMBIANO (tú/usted; NUNCA argentino: nada de "vos/pedí/contame").
- Concreto y comercial, sin relleno ni humo. Cada carencia debe ser accionable, cada maleta un insight real de compra.
- Las emociones DEBEN salir de esta taxonomía fija (usa solo estos valores, 3 a 5): ${EMOCIONES.join(", ")}.
- Identifica de 3 a 5 "maletas" (drivers de compra) con su insight: por qué realmente compra la gente en este nicho, no lo que dicen que compran.
- El buyer persona con 3 jobs-to-be-done (qué "trabajo" contrata el cliente al comprar).
- La propuesta debe conectar la data de la marca con la data de nicho de Bushido, con ritmo/constancia, no piezas sueltas.
- Recomienda UN paquete real de Bushido (nombre y precio EXACTOS de la lista) según la etapa de la marca:
${PAQUETES}
- Si no conoces la marca con certeza, infiere desde el nicho de forma honesta y prudente; es un borrador que un humano de Bushido revisa antes de enviar.`;

// Esquema de salida estructurada (structured outputs). El modelo produce solo
// el diagnóstico; marca/redes/web/fecha/estado los ponemos nosotros.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    nicho: { type: "string", description: "Nicho + sector, ej: 'Repostería artesanal · gastronomía'" },
    resumen: { type: "string", description: "2-3 frases: el diagnóstico central, sin rodeos" },
    fortalezas: { type: "array", items: { type: "string" }, description: "3 a 4 fortalezas reales" },
    carencias: { type: "array", items: { type: "string" }, description: "3 a 4 carencias accionables" },
    oportunidades: { type: "array", items: { type: "string" }, description: "3 oportunidades sin explotar" },
    buyerPersona: {
      type: "object",
      additionalProperties: false,
      properties: {
        nombre: { type: "string", description: "Nombre corto y evocador del arquetipo, ej: 'La que se premia'" },
        descripcion: { type: "string" },
        jtbd: { type: "array", items: { type: "string" }, description: "3 jobs-to-be-done" },
      },
      required: ["nombre", "descripcion", "jtbd"],
    },
    maletas: {
      type: "array",
      description: "3 a 5 maletas (drivers de compra)",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombre: { type: "string" },
          insight: { type: "string" },
        },
        required: ["nombre", "insight"],
      },
    },
    emociones: {
      type: "array",
      description: "3 a 5 emociones de la taxonomía fija",
      items: { type: "string", enum: [...EMOCIONES] },
    },
    propuesta: { type: "string", description: "El sistema de contenido propuesto, 2-3 frases" },
    paquete: {
      type: "object",
      additionalProperties: false,
      properties: {
        nombre: { type: "string", description: "Nombre EXACTO de un paquete de Bushido" },
        precio: { type: "string", description: "Precio EXACTO, ej: '$3.200.000 / mes'" },
        porque: { type: "string", description: "Por qué ese paquete para esta etapa" },
      },
      required: ["nombre", "precio", "porque"],
    },
  },
  required: [
    "nicho", "resumen", "fortalezas", "carencias", "oportunidades",
    "buyerPersona", "maletas", "emociones", "propuesta", "paquete",
  ],
} as const;

/** Genera el análisis con Claude. Devuelve null si no hay ANTHROPIC_API_KEY. */
export async function generarAnalisis(input: AnalizarInput): Promise<Analisis | null> {
  if (!KEY) {
    console.warn("[analizar] SIN ANTHROPIC_API_KEY — configúrala en Vercel para el análisis automático.");
    return null;
  }
  const client = new Anthropic({ apiKey: KEY });

  const userMsg = [
    `Marca: ${input.marca}`,
    `Redes: ${input.redes || "—"}`,
    `Sitio web: ${input.web || "—"}`,
    `Contexto del cliente: ${input.contexto || "—"}`,
    "",
    "Analiza esta marca con las 7 maletas y devuelve el informe estructurado.",
  ].join("\n");

  const res = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("El modelo no devolvió contenido de texto.");
  }
  const data = JSON.parse(textBlock.text) as Omit<
    Analisis,
    "marca" | "redes" | "web" | "fecha" | "estado"
  >;

  return {
    marca: input.marca,
    redes: input.redes,
    web: input.web,
    fecha: String(new Date().getFullYear()),
    nicho: data.nicho,
    resumen: data.resumen,
    fortalezas: data.fortalezas,
    carencias: data.carencias,
    oportunidades: data.oportunidades,
    buyerPersona: data.buyerPersona,
    maletas: data.maletas,
    emociones: data.emociones,
    propuesta: data.propuesta,
    paquete: data.paquete,
    estado: "analizado",
  };
}
