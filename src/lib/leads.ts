import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { forwardToServer } from "./forward";

export type LeadKind = "analisis" | "contacto" | "talento" | "descarga" | "rental";

export interface LeadInput {
  kind: LeadKind;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  social?: string;
  web?: string;
  role?: string;
  portfolio?: string;
  behance?: string;
  reel?: string;
  links?: string;
  project?: string;
  message?: string;
  pack?: string;
  meta?: Record<string, unknown>;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_NOTIFY_EMAIL =
  process.env.LEAD_NOTIFY_EMAIL || "servicios@bushidoav.com";
const LEAD_FROM_EMAIL =
  process.env.LEAD_FROM_EMAIL || "Bushido <onboarding@resend.dev>";

export function hasDb(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
export function hasEmail(): boolean {
  return Boolean(RESEND_API_KEY);
}

const KIND_LABEL: Record<LeadKind, string> = {
  analisis: "Análisis gratis",
  contacto: "Propuesta / contacto",
  talento: "Banco de talentos",
  descarga: "Descargable",
  rental: "Alquiler de equipos",
};

/**
 * Store the lead. Uses Supabase when configured, otherwise a local JSON file (dev).
 * Devuelve el id del lead (para enlazarlo con su análisis) o null si no hay BD.
 */
export async function storeLead(lead: LeadInput): Promise<string | null> {
  // reenvío a tu servidor de monitoreo (best-effort, no bloquea)
  forwardToServer("lead", { ...lead }).catch(() => {});
  if (hasDb()) {
    const supabase = createClient(
      SUPABASE_URL as string,
      SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
      .from("leads")
      .insert({
        kind: lead.kind,
        name: lead.name ?? null,
        company: lead.company ?? null,
        email: lead.email ?? null,
        phone: lead.phone ?? null,
        social: lead.social ?? null,
        web: lead.web ?? null,
        role: lead.role ?? null,
        portfolio: lead.portfolio ?? null,
        behance: lead.behance ?? null,
        reel: lead.reel ?? null,
        links: lead.links ?? null,
        project: lead.project ?? null,
        message: lead.message ?? null,
        pack: lead.pack ?? null,
        meta: lead.meta ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return (data?.id as string) ?? null;
  }

  // Sin Supabase configurado: guarda en disco si se puede (dev), sin romper en
  // serverless (Vercel tiene FS de solo lectura salvo /tmp). NUNCA lanza error,
  // para que el aviso por correo siga funcionando aunque no haya base de datos.
  console.warn(
    `[lead:${lead.kind}] SIN SUPABASE — configura SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en Vercel para persistir.`
  );
  const id = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
  const record = { id, ...lead, created_at: new Date().toISOString() };
  const dirs = [path.join(process.cwd(), ".data"), path.join(os.tmpdir(), "bushido")];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.json");
      let existing: unknown[] = [];
      try {
        existing = JSON.parse(await fs.readFile(file, "utf8"));
      } catch {
        existing = [];
      }
      existing.push(record);
      await fs.writeFile(file, JSON.stringify(existing, null, 2), "utf8");
      return id;
    } catch {
      // intenta el siguiente directorio
    }
  }
  return null;
}

// ── Cotización interna: clasificación automática por tipo de proyecto ──
const CLASSIFY: Record<string, { cat: string; rango: string }> = {
  "Videoclip musical": { cat: "Música · Videoclip", rango: "$3.000.000 – $5.000.000" },
  "Cobertura de evento": { cat: "Eventos", rango: "$1.000.000 – $2.500.000" },
  "Reels / contenido de marca": { cat: "Contenido · Reels", rango: "$500.000 – $2.400.000" },
  "Mini comercial / campaña": { cat: "Campaña", rango: "$1.700.000 – $4.200.000" },
  "Video corporativo": { cat: "Empresa", rango: "$2.800.000 – $6.500.000+" },
  "Video de producto": { cat: "Producto", rango: "$550.000 – $3.000.000" },
  "Fotografía editorial": { cat: "Editorial", rango: "cotización a medida" },
  "Otro / múltiples": { cat: "General", rango: "cotización a medida" },
};

export function classifyProject(project?: string): { cat: string; rango: string } | null {
  if (!project) return null;
  return CLASSIFY[project] || { cat: "General", rango: "cotización a medida" };
}

function renderRows(lead: LeadInput): string {
  const clasif = classifyProject(lead.project);
  const rows: [string, string | undefined][] = [
    ["Tipo", KIND_LABEL[lead.kind]],
    ["Nombre", lead.name],
    ["Marca / empresa", lead.company],
    ["Email", lead.email],
    ["WhatsApp", lead.phone ? `+57 ${lead.phone}` : undefined],
    ["Redes", lead.social],
    ["Sitio web", lead.web],
    ["Rol", lead.role],
    ["Portafolio", lead.portfolio],
    ["Behance", lead.behance],
    ["Reel", lead.reel],
    ["Otros links", lead.links],
    ["Proyecto", lead.project],
    ["Clasificación", clasif ? clasif.cat : undefined],
    ["Estimado sugerido", clasif ? clasif.rango : undefined],
    ["Pack", lead.pack],
    ["Mensaje", lead.message],
  ];
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px;color:#8A8784;font:12px monospace;white-space:nowrap">${k}</td><td style="padding:6px 14px;color:#151515">${v}</td></tr>`
    )
    .join("");
}

/** Notify Bushido by email. No-op (logs) when Resend is not configured. */
export async function notifyLead(lead: LeadInput): Promise<void> {
  if (!hasEmail()) {
    console.log(
      `[lead:${lead.kind}] email skipped (no RESEND_API_KEY). Would notify ${LEAD_NOTIFY_EMAIL}.`
    );
    return;
  }
  const resend = new Resend(RESEND_API_KEY as string);
  const subject = `Nuevo lead · ${KIND_LABEL[lead.kind]} · ${lead.name ?? "sin nombre"}`;
  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#0A0A0B;padding:28px">
      <div style="max-width:560px;margin:0 auto;background:#EDE7DA;border-radius:8px;overflow:hidden">
        <div style="background:#D5322E;color:#EDE7DA;padding:16px 22px;font:700 16px Helvetica">
          BUSH<span style="color:#0A0A0B">I</span>DO · nuevo lead
        </div>
        <table style="width:100%;border-collapse:collapse">${renderRows(lead)}</table>
        <div style="padding:14px 22px;color:#8A8784;font:11px monospace">
          bushidoav.com · responde en menos de 24h
        </div>
      </div>
    </div>`;
  // Resend NO lanza excepción si la API rechaza: devuelve { error }. Hay que revisarlo.
  const { data, error } = await resend.emails.send({
    from: LEAD_FROM_EMAIL,
    to: LEAD_NOTIFY_EMAIL,
    subject,
    html,
    replyTo: lead.email,
  });
  if (error) {
    console.error(`[notifyLead] Resend rechazó (from="${LEAD_FROM_EMAIL}" to="${LEAD_NOTIFY_EMAIL}"):`, error);
    throw new Error(`Resend: ${error.message}`);
  }
  console.log(`[notifyLead] enviado id=${data?.id} → ${LEAD_NOTIFY_EMAIL}`);
}

/**
 * Cotización interna automática: responde al CLIENTE al instante con un
 * estimado según su tipo de proyecto y los siguientes pasos. Sin cotizador
 * público. No-op si no hay Resend o email. (En modo prueba, Resend solo entrega
 * al correo de la cuenta; funcionará del todo cuando el dominio esté verificado.)
 */
export async function sendClientAutoReply(lead: LeadInput): Promise<void> {
  if (!hasEmail() || !lead.email) {
    console.log(`[auto-reply skipped] kind=${lead.kind} email=${lead.email ?? "—"}`);
    return;
  }
  const clasif = classifyProject(lead.project);
  const resend = new Resend(RESEND_API_KEY as string);
  const nombre = (lead.name || "").split(" ")[0] || "";
  const estimateBlock = clasif
    ? `<p style="margin:0 0 6px;color:#8A8784;font:12px monospace;letter-spacing:1px;text-transform:uppercase">Rango estimado · ${clasif.cat}</p>
       <p style="margin:0 0 20px;color:#0A0A0B;font:600 24px Georgia,serif">${clasif.rango}</p>
       <p style="margin:0 0 20px;color:#514E4A;font:14px/1.6 Helvetica,Arial">Es un rango de referencia — el valor final lo afinamos según tu idea, formato y alcance.</p>`
    : `<p style="margin:0 0 20px;color:#514E4A;font:14px/1.6 Helvetica,Arial">Vamos a preparar una propuesta a la medida de lo que necesitas.</p>`;

  const html = `
    <div style="background:#0A0A0B;padding:30px">
      <div style="max-width:560px;margin:0 auto;background:#EDE7DA;border-radius:10px;overflow:hidden">
        <div style="background:#D5322E;color:#EDE7DA;padding:16px 24px;font:700 16px Helvetica;letter-spacing:2px">
          BUSH<span style="color:#0A0A0B">I</span>DO
        </div>
        <div style="padding:28px 24px">
          <p style="margin:0 0 16px;color:#0A0A0B;font:400 26px Georgia,serif">Hola ${nombre}, recibimos tu solicitud.</p>
          <p style="margin:0 0 22px;color:#514E4A;font:14px/1.6 Helvetica,Arial">
            Gracias por escribirnos. Un asesor de Bushido te contacta en menos de 24 horas
            para afinar tu propuesta${lead.phone ? " por WhatsApp" : ""}.
          </p>
          ${estimateBlock}
          <p style="margin:0;color:#8A8784;font:11px monospace;letter-spacing:1px">Criterio antes que equipo · bushidoav.com</p>
        </div>
      </div>
    </div>`;

  const { data, error } = await resend.emails.send({
    from: LEAD_FROM_EMAIL,
    to: lead.email,
    subject: "Recibimos tu solicitud · Bushido",
    html,
  });
  if (error) {
    console.error(`[autoReply] Resend rechazó (from="${LEAD_FROM_EMAIL}" to="${lead.email}"):`, error);
    throw new Error(`Resend: ${error.message}`);
  }
  console.log(`[autoReply] enviado id=${data?.id} → ${lead.email}`);
}
