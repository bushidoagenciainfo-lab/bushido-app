import { NextResponse, after } from "next/server";
import { z } from "zod";
import {
  storeLead,
  notifyLead,
  sendClientAutoReply,
  classifyProject,
  type LeadInput,
} from "@/lib/leads";
import { generarAnalisis, hasIA } from "@/lib/analizar";
import { storeAnalisis, informeUrl, emailInformeListo } from "@/lib/analisis-store";
import { alertaBushidoWhatsApp, sendClientWhatsApp } from "@/lib/whatsapp";
import { alertaTelegram } from "@/lib/telegram";
import { forwardToServer } from "@/lib/forward";

export const runtime = "nodejs";
// El informe automático (Claude) corre en 2º plano con after(); dale aire.
export const maxDuration = 60;

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
    // 1) avisos a Bushido: correo + WhatsApp + Telegram (a ti, para estar pendiente)
    await notifyLead(lead).catch((err) => console.error("notifyLead error:", err));
    const resumen =
      `🔔 Nuevo lead · ${lead.kind}\n` +
      `${lead.name || "—"}${lead.company ? " · " + lead.company : ""}\n` +
      `${lead.email || ""}${lead.phone ? " · +57 " + lead.phone : ""}\n` +
      `${lead.social || ""}`;
    await alertaBushidoWhatsApp(resumen);
    await alertaTelegram(resumen);

    // 2) análisis: generar el informe con Claude y enviárselo al cliente (correo + WhatsApp)
    if (lead.kind === "analisis" && hasIA()) {
      try {
        const analisis = await generarAnalisis({
          marca: lead.company || lead.name || "Marca",
          redes: lead.social,
          tiktok: lead.tiktok,
          web: lead.web,
          contexto: lead.project, // "¿Qué busca?" el cliente
        });
        if (analisis) {
          const id = await storeAnalisis(analisis, leadId ?? undefined);
          const url = informeUrl(id);
          // reenvía el análisis estructurado a tu servidor de data
          forwardToServer("analisis", { leadId, ...analisis }).catch(() => {});
          if (lead.email) {
            await emailInformeListo({
              email: lead.email,
              nombre: lead.name,
              marca: analisis.marca,
              url,
            }).catch((e) => console.error("emailInforme error:", e));
          }
          // WhatsApp al cliente con el link (canal directo). params: nombre, marca, link
          await sendClientWhatsApp({
            phone: lead.phone,
            params: [(lead.name || "").split(" ")[0] || "hola", analisis.marca, url],
          });
          return; // el informe reemplaza al auto-reply genérico
        }
      } catch (e) {
        console.error("auto-informe error:", e);
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
