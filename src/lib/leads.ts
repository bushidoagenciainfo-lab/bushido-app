import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { promises as fs } from "node:fs";
import path from "node:path";

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

/** Store the lead. Uses Supabase when configured, otherwise a local JSON file (dev). */
export async function storeLead(lead: LeadInput): Promise<void> {
  if (hasDb()) {
    const supabase = createClient(
      SUPABASE_URL as string,
      SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } }
    );
    const { error } = await supabase.from("leads").insert({
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
    });
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return;
  }

  // Dev fallback: append to .data/leads.json
  const dir = path.join(process.cwd(), ".data");
  const file = path.join(dir, "leads.json");
  await fs.mkdir(dir, { recursive: true });
  let existing: unknown[] = [];
  try {
    existing = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    existing = [];
  }
  existing.push({ ...lead, created_at: new Date().toISOString() });
  await fs.writeFile(file, JSON.stringify(existing, null, 2), "utf8");
  console.log(`[lead:${lead.kind}] stored locally (no Supabase configured):`, {
    name: lead.name,
    email: lead.email,
  });
}

function renderRows(lead: LeadInput): string {
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
  await resend.emails.send({
    from: LEAD_FROM_EMAIL,
    to: LEAD_NOTIFY_EMAIL,
    subject,
    html,
    replyTo: lead.email,
  });
}
