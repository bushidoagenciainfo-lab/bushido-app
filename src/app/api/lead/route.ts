import { NextResponse, after } from "next/server";
import { z } from "zod";
import {
  storeLead,
  notifyLead,
  sendClientAutoReply,
  classifyProject,
  marcarInforme,
  type LeadInput,
} from "@/lib/leads";
import { hasIA } from "@/lib/analizar";
import { alertaBushidoWhatsApp } from "@/lib/whatsapp";
import { alertaTelegram } from "@/lib/telegram";

export const runtime = "nodejs";
// Esta ruta solo guarda + avisa (rápido). El análisis pesado se delega a
// /api/generar-informe para que tenga su propio presupuesto de tiempo.
export const maxDuration = 60;

/** URL base del sitio, para llamar a nuestras propias rutas desde el servidor. */
function baseUrl(req: Request): string {
  const env = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return new URL(req.url).origin;
}

const schema = z.object({
  kind: z.enum(["analisis", "contacto", "talento", "descarga"]),
  name: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  social: z.string().trim().max(300).optional(),
  tiktok: z.string().trim().max(300).optional(),
  web: z.string().trim().max(300).optional(),
  role: z.string().trim().max(120).optional(),
  portfolio: z.string().trim().max(300).optional(),
  behance: z.string().trim().max(300).optional(),
  reel: z.string().trim().max(300).optional(),
  links: z.string().trim().max(600).optional(),
  project: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
  pack: z.string().trim().max(160).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  // honeypot: bots fill this hidden field; humans never do
  website_hp: z.string().max(0).optional(),
});

// minimal required fields per lead kind
const REQUIRED: Record<string, (keyof LeadInput)[]> = {
  analisis: ["name", "email", "phone", "company", "social"],
  contacto: ["name", "email", "phone"],
  talento: ["name", "email", "role"],
  descarga: ["email"],
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { website_hp, ...data } = parsed.data;
  if (website_hp) {
    // silently accept the bot without doing anything
    return NextResponse.json({ ok: true });
  }

  const missing = (REQUIRED[data.kind] ?? []).filter(
    (k) => !data[k] || String(data[k]).trim() === ""
  );
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Faltan campos: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  // Cotización interna: clasifica y guarda el estimado; guarda tiktok en meta
  const lead = data as LeadInput;
  const clasif = classifyProject(lead.project);
  lead.meta = {
    ...(lead.meta ?? {}),
    ...(clasif ? { categoria: clasif.cat, rango: clasif.rango } : {}),
    ...(lead.tiktok ? { tiktok: lead.tiktok } : {}),
  };

  let leadId: string | null = null;
  try {
    leadId = await storeLead(lead);
  } catch (err) {
    console.error("storeLead error:", err);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar tu solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }

  // El trabajo pesado corre DESPUÉS de responder (after()): en Vercel esto sí se
  // ejecuta, a diferencia del "dispara y olvida" que se moría al responder.
  // Así la persona ve "recibido" al instante y el correo + informe salen solos.
  after(async () => {
    const tStart = Date.now();
    console.log(`[after] arrancó · kind=${lead.kind} · leadId=${leadId ?? "sin-db"}`);
    // 1) avisos a Bushido: correo + WhatsApp + Telegram (a ti, para estar pendiente)
    await notifyLead(lead).catch((err) => console.error("notifyLead error:", err));
    console.log(`[after] avisos enviados (${Date.now() - tStart}ms)`);
    const resumen =
      `🔔 Nuevo lead · ${lead.kind}\n` +
      `${lead.name || "—"}${lead.company ? " · " + lead.company : ""}\n` +
      `${lead.email || ""}${lead.phone ? " · +57 " + lead.phone : ""}\n` +
      `${lead.social || ""}`;
    await alertaBushidoWhatsApp(resumen);
    await alertaTelegram(resumen);

    // 2) análisis: se delega a /api/generar-informe (su propio presupuesto de
    //    tiempo: la búsqueda web sola tarda ~35s y aquí no cabía).
    const secret = process.env.INTERNAL_SECRET || process.env.ANALIZAR_SECRET;
    // Si no se puede ni intentar, queda escrito en el lead (se ve en /admin).
    if (lead.kind === "analisis" && leadId && (!hasIA() || !secret)) {
      await marcarInforme(leadId, {
        ok: false,
        error: !hasIA()
          ? "Falta ANTHROPIC_API_KEY en el entorno."
          : "Falta INTERNAL_SECRET / ANALIZAR_SECRET en el entorno.",
      });
    }
    if (lead.kind === "analisis" && hasIA() && secret) {
      try {
        const res = await fetch(`${baseUrl(request)}/api/generar-informe`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            secret,
            marca: lead.company || lead.name || "Marca",
            redes: lead.social,
            tiktok: lead.tiktok,
            web: lead.web,
            contexto: lead.project, // "¿Qué busca?" el cliente
            leadId,
            email: lead.email,
            nombre: lead.name,
            phone: lead.phone,
          }),
          signal: AbortSignal.timeout(10000),
        });
        console.log(`[after] informe encolado (${res.status}) en ${Date.now() - tStart}ms`);
        if (res.ok) return; // el informe reemplaza al auto-reply genérico
        if (leadId) {
          await marcarInforme(leadId, {
            ok: false,
            error: `/api/generar-informe respondió ${res.status}`,
          });
        }
      } catch (e) {
        console.error("[after] no se pudo encolar el informe:", e);
        if (leadId) {
          await marcarInforme(leadId, {
            ok: false,
            error: `No se pudo encolar: ${e instanceof Error ? e.message : String(e)}`,
          });
        }
        // si falla, cae al auto-reply de abajo como acuse
      }
    }

    // 3) acuse al cliente (contacto, o análisis sin IA / si el informe falló)
    if (lead.kind === "contacto" || lead.kind === "analisis") {
      await sendClientAutoReply(lead).catch((err) =>
        console.error("autoReply error:", err)
      );
    }
  });

  return NextResponse.json({ ok: true });
}
