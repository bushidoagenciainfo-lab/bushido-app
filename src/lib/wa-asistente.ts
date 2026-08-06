// Asistente de respuesta para la bandeja de WhatsApp.
//
// A propósito NO envía nada: redacta un borrador para que Maick lo lea, lo
// ajuste y lo mande. La venta de Bushido es consultiva y un bot contestando
// solo bajaría el nivel percibido de la agencia justo cuando más importa.

import Anthropic from "@anthropic-ai/sdk";
import { listMensajes } from "./wa-inbox";
import { listLeads } from "./admin";
import { toWhatsAppNumber } from "./whatsapp";
import { SERVICES } from "./site";

const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `Eres quien responde los WhatsApp de Bushido, una agencia audiovisual de Bogotá.
Escribes EN NOMBRE DE MAICK, el dueño. Tu texto lo lee él y lo envía: escribe como si fueras él, no como un bot.

CÓMO ESCRIBES:
- Español colombiano, tono directo y cercano. Nada de "estimado cliente" ni "quedamos atentos a su respuesta".
- CORTO. Dos o tres frases. Es WhatsApp, no un correo.
- Una sola idea por mensaje y UNA sola pregunta al final.
- Sin emojis salvo que la otra persona los use primero.
- Nunca inventes precios, plazos ni cosas que no estén en el contexto que te doy.

EL OBJETIVO SIEMPRE ES EL MISMO: mover la conversación hacia una llamada o reunión corta.
Pero sin desesperación: si la persona apenas está preguntando, primero resuelve su duda y AHÍ propones.

CÓMO PROPONER LA REUNIÓN (según en qué punto va la conversación):
- Si acaba de recibir el análisis y respondió algo corto ("gracias", "interesante") → reconoce, suelta UN dato concreto de su diagnóstico y propón 15 minutos para explicárselo.
- Si pregunta precios → responde con el rango real del servicio que le sirve y propón la llamada para aterrizar el alcance.
- Si pone una objeción (caro, lo pienso, después) → no insistas ni discutas. Reconócela, deja una puerta abierta concreta y pregunta cuándo tiene sentido retomar.
- Si ya hay interés claro → propón día y hora concretos, no "cuando puedas".

NUNCA: mandar varios mensajes seguidos, repetir lo que ya dijiste, ni sonar a plantilla.`;

/** Rango de precios real, para que el borrador no invente cifras. */
function preciosResumidos(): string {
  return SERVICES.map((s) => {
    const p = s.packages.map((x) => `${x.name}: ${x.price}`).join(" · ");
    return `- ${s.title} ${s.titleEm} → ${p}`;
  }).join("\n");
}

/**
 * Redacta la respuesta sugerida para un contacto, usando su conversación y,
 * si lo encontramos, su ficha de lead.
 */
export async function borradorRespuesta(wa_id: string): Promise<string> {
  if (!KEY) throw new Error("Falta ANTHROPIC_API_KEY.");

  const mensajes = await listMensajes(wa_id, 30);
  if (!mensajes.length) throw new Error("No hay conversación con este contacto.");

  // ¿Quién es? Lo cruzamos con los leads por teléfono.
  let ficha = "";
  try {
    const leads = await listLeads(200);
    const objetivo = toWhatsAppNumber(wa_id);
    const lead = leads.find((l) => toWhatsAppNumber(l.phone) === objetivo);
    if (lead) {
      ficha = [
        `Es un lead registrado:`,
        `- Nombre: ${lead.name ?? "—"}${lead.company ? ` (${lead.company})` : ""}`,
        `- Qué pidió: ${lead.project ?? "no especificó"}`,
        `- Estado en el pipeline: ${lead.status ?? "nuevo"}`,
        lead.social ? `- Instagram: ${lead.social}` : "",
        lead.message ? `- Lo que escribió en el formulario: "${lead.message}"` : "",
        (lead.meta as Record<string, unknown>)?.informe
          ? `- Ya recibió su análisis gratis.`
          : `- Todavía NO ha recibido el análisis.`,
      ]
        .filter(Boolean)
        .join("\n");
    }
  } catch {
    /* si falla el cruce, seguimos sin ficha */
  }

  const chat = mensajes
    .map((m) => `${m.direccion === "entrante" ? "ELLOS" : "NOSOTROS"}: ${m.texto ?? `(${m.tipo})`}`)
    .join("\n");

  const client = new Anthropic({ apiKey: KEY });
  const res = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            ficha || "(No está registrado como lead: es un contacto nuevo.)",
            "",
            "PRECIOS REALES DE BUSHIDO (no inventes otros):",
            preciosResumidos(),
            "",
            "CONVERSACIÓN HASTA AHORA:",
            chat,
            "",
            "Escribe SOLO el mensaje que hay que mandarle ahora. Sin saludos de relleno, sin explicar lo que vas a hacer, sin comillas.",
          ].join("\n"),
        },
      ],
    },
    { timeout: 30000, maxRetries: 1 }
  );

  const bloque = res.content.find((c) => c.type === "text");
  if (!bloque || bloque.type !== "text") throw new Error("El modelo no devolvió texto.");
  return bloque.text.trim();
}
