// Motor de análisis de Bushido — corre el framework de las 7 maletas con la
// API de Claude y devuelve un `Analisis` estructurado listo para la plantilla.
//
// Requiere ANTHROPIC_API_KEY (ponla en Vercel → Environment Variables). Si no
// está configurada, generarAnalisis() devuelve null (no rompe: el resto del
// pipeline sigue funcionando, solo no se genera el informe automático).

import Anthropic from "@anthropic-ai/sdk";
import { EMOCIONES, type Analisis, type EmocionDetalle, type Emocion } from "./analisis";

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

const SYSTEM = `Eres el estratega de contenido de Bushido, una agencia audiovisual de Bogotá, Colombia (bushidoav.com). Tu criterio es cinematográfico, editorial y comercial: no vendes horas de cámara, vendes criterio visual que hace que la gente recuerde y compre. Hablas con seguridad, sin humo, como quien ya vio el patrón mil veces.

Analizas una marca aplicando el framework de las "7 maletas de cualquier compra" de Felipe Vergara: toda compra la mueve un motivo (racional o emocional) — el "gatillo" que dispara la decisión. Tu trabajo es descubrir esos gatillos y traducirlos en un plan de contenido y de presencia digital accionable, del que Bushido pueda encargarse.

REGLAS DE VOZ:
- Español COLOMBIANO (tú/usted; NUNCA argentino: nada de "vos/pedí/contame").
- Concreto y comercial, sin relleno. Cada carencia es accionable, cada gatillo un insight real de compra, cada recomendación algo que Bushido pueda ejecutar.

QUÉ DEBES PRODUCIR:
- diagnóstico: fortalezas, carencias (accionables) y oportunidades sin explotar.
- buyerPersona con 3 jobs-to-be-done (qué "trabajo" contrata el cliente al comprar).
- gatillos: 3 a 5 drivers de compra con su insight (por qué realmente compra la gente en este nicho, no lo que dicen).
- emociones: 3 a 5 de la taxonomía fija, y por CADA una un argumento corto de por qué mueve la compra en ESTA marca. Taxonomía: ${EMOCIONES.join(", ")}. Usa solo esos valores.
- canales (PRESENCIA DIGITAL): audita los canales clave — Instagram, TikTok, YouTube, "Sitio web" y "Google / reseñas". Marca su estado (fuerte | irregular | débil | ausente). Si la marca NO tiene web o NO tiene ficha/reseñas de Google, decláralo "ausente" y recomiéndalo como un SERVICIO que Bushido puede resolver (landing/catálogo de pedidos, Google Business + estrategia de reseñas). No inventes que existe algo si el contexto sugiere que no.
- metricas: 3 métricas de redes que la marca debería vigilar, con qué mirar y por qué. NO inventes números ni porcentajes concretos: describe QUÉ medir y por qué importa (retención de reels, guardados/compartidos, alcance de no-seguidores, etc.).
- propuesta: el sistema de contenido y presencia, conectando la data de la marca con la data de nicho de Bushido, con ritmo/constancia, no piezas sueltas.
- paquete: recomienda UNO real de Bushido (nombre y precio EXACTOS de la lista) según la etapa de la marca:
${PAQUETES}

Si no conoces la marca con certeza, infiere desde el nicho de forma honesta y prudente; es un borrador que un humano de Bushido revisa antes de enviar.`;

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
        nombre: { type: "string", description: "Nombre corto y evocador del arquetipo, ej: 'La que se da el gusto bonito'" },
        descripcion: { type: "string" },
        jtbd: { type: "array", items: { type: "string" }, description: "3 jobs-to-be-done" },
      },
      required: ["nombre", "descripcion", "jtbd"],
    },
    gatillos: {
      type: "array",
      description: "3 a 5 gatillos (drivers de compra)",
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
      description: "3 a 5 emociones de la taxonomía fija, cada una con su argumento",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          emocion: { type: "string", enum: [...EMOCIONES] },
          porque: { type: "string", description: "Por qué esa emoción mueve la compra en esta marca (1-2 frases)" },
        },
        required: ["emocion", "porque"],
      },
    },
    canales: {
      type: "array",
      description: "Auditoría de presencia: Instagram, TikTok, YouTube, Sitio web, Google / reseñas",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          canal: { type: "string" },
          estado: { type: "string", enum: ["fuerte", "irregular", "débil", "ausente"] },
          nota: { type: "string", description: "Diagnóstico corto del canal" },
          recomendacion: { type: "string", description: "Qué hacer (servicio Bushido cuando aplica)" },
        },
        required: ["canal", "estado", "nota", "recomendacion"],
      },
    },
    metricas: {
      type: "array",
      description: "3 métricas de redes a vigilar (sin inventar números)",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombre: { type: "string" },
          queMirar: { type: "string" },
          porQue: { type: "string" },
        },
        required: ["nombre", "queMirar", "porQue"],
      },
    },
    propuesta: { type: "string", description: "El sistema de contenido/presencia propuesto, 2-3 frases" },
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
    "buyerPersona", "gatillos", "emociones", "canales", "metricas",
    "propuesta", "paquete",
  ],
} as const;

interface ModelOut {
  nicho: string;
  resumen: string;
  fortalezas: string[];
  carencias: string[];
  oportunidades: string[];
  buyerPersona: Analisis["buyerPersona"];
  gatillos: Analisis["gatillos"];
  emociones: EmocionDetalle[];
  canales: Analisis["canales"];
  metricas: Analisis["metricas"];
  propuesta: string;
  paquete: Analisis["paquete"];
}

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
    `Sitio web: ${input.web || "(no reporta sitio web)"}`,
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
  const data = JSON.parse(textBlock.text) as ModelOut;

  // taxonomía plana (para consultar/comparar) derivada del detalle
  const emociones = (data.emociones ?? []).map((e) => e.emocion) as Emocion[];

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
    gatillos: data.gatillos,
    emociones,
    emocionesDetalle: data.emociones,
    canales: data.canales,
    metricas: data.metricas,
    propuesta: data.propuesta,
    paquete: data.paquete,
    estado: "analizado",
  };
}
