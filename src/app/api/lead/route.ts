import { NextResponse } from "next/server";
import { z } from "zod";
import { storeLead, notifyLead, type LeadInput } from "@/lib/leads";

export const runtime = "nodejs";

const schema = z.object({
  kind: z.enum(["analisis", "contacto", "talento", "descarga"]),
  name: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  social: z.string().trim().max(300).optional(),
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

  try {
    await storeLead(data as LeadInput);
  } catch (err) {
    console.error("storeLead error:", err);
    return NextResponse.json(
      { ok: false, error: "No pudimos guardar tu solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }

  // fire-and-forget the email so a mail hiccup never blocks the user
  notifyLead(data as LeadInput).catch((err) =>
    console.error("notifyLead error:", err)
  );

  return NextResponse.json({ ok: true });
}
