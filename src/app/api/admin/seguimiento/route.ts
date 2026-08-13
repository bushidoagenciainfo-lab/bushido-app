import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { listLeads, analisisParaOS } from "@/lib/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  leadId: z.string().trim().min(1).max(80),
  dias: z.number().int().min(0).max(365).optional(),
});

const SYSTEM = `Escribes el WhatsApp de seguimiento que Maick, dueño de Bushido (agencia
audiovisual de Bogotá), le manda a un lead que no ha respondido.

CÓMO ESCRIBES:
- Español colombiano, directo y humano. Como escribe un dueño, no una agencia.
- CORTO: 3 o 4 líneas. Es WhatsApp.
- UNA sola pregunta, al final.
- Sin emojis. Sin "espero que estés muy bien". Sin "quería hacerle seguimiento a mi anterior mensaje".
- Nunca sonar a reclamo por no haber respondido.

LA CLAVE: si tienes el análisis de su marca, ABRE con un hallazgo concreto de ahí
—un número, una carencia puntual— para demostrar que el trabajo existe y es sobre
ELLOS. Eso es lo que hace que contesten. Después propón la llamada de 15 minutos.

Si no hay análisis, pregunta algo específico de su negocio para abrir conversación.

Devuelve SOLO el mensaje, sin comillas ni explicaciones.`;

/** Redacta el mensaje de seguimiento usando el análisis de esa marca. */
export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "Falta ANTHROPIC_API_KEY." }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Envío inválido." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }
  const { leadId, dias } = parsed.data;

  const leads = await listLeads(500);
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "No encontré ese lead." }, { status: 404 });
  }

  // ¿Tenemos su análisis? Ahí está el material que hace que contesten.
  let diagnostico = "";
  try {
    const todos = await analisisParaOS(500);
    const marca = (lead.company || lead.name || "").toLowerCase().trim();
    const suyo = todos.find(
      (a) => String(a.marca ?? "").toLowerCase().trim() === marca
    );
    if (suyo) {
      const lista = (v: unknown) =>
        Array.isArray(v) ? (v as string[]).slice(0, 3).join(" · ") : "";
      diagnostico = [
        `Análisis de ${suyo.marca} (${suyo.categoria ?? "—"}):`,
        suyo.resumen ? `Resumen: ${suyo.resumen}` : "",
        lista(suyo.carencias) ? `Carencias: ${lista(suyo.carencias)}` : "",
        lista(suyo.oportunidades) ? `Oportunidades: ${lista(suyo.oportunidades)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
  } catch {
    /* sin análisis, el mensaje sale igual */
  }

  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 500,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `Persona: ${lead.name ?? "—"}${lead.company ? ` · ${lead.company}` : ""}`,
            `Qué pidió: ${lead.project ?? "no especificó"}`,
            lead.message ? `Escribió: "${lead.message}"` : "",
            `Entró hace ${dias ?? "varios"} días. Estado: ${lead.status ?? "nuevo"}.`,
            (lead.meta as Record<string, unknown>)?.informe
              ? "Ya recibió su análisis por correo y WhatsApp."
              : "Todavía NO ha recibido análisis.",
            "",
            diagnostico || "(No tenemos análisis de esta marca.)",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    },
    { timeout: 25000, maxRetries: 1 }
  );

  const bloque = res.content.find((c) => c.type === "text");
  if (!bloque || bloque.type !== "text") {
    return NextResponse.json({ ok: false, error: "No se pudo redactar." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, mensaje: bloque.text.trim() });
}
