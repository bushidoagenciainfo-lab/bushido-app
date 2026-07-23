import { NextResponse, after } from "next/server";
import { z } from "zod";
import { storeLead, notifyLead, type LeadInput } from "@/lib/leads";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(40),
  dates: z.string().trim().max(160).optional(),
  message: z.string().trim().max(1000).optional(),
  items: z.array(z.string().trim().max(120)).min(1).max(80),
  website_hp: z.string().max(0).optional(),
});

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
      { ok: false, error: "Revisa nombre, WhatsApp y que hayas agregado equipos." },
      { status: 422 }
    );
  }
  const { website_hp, ...d } = parsed.data;
  if (website_hp) return NextResponse.json({ ok: true }); // bot

  const lines: string[] = [];
  lines.push("Equipos solicitados:");
  d.items.forEach((i) => lines.push(`• ${i}`));
  if (d.dates) lines.push(`\nFechas: ${d.dates}`);
  if (d.message) lines.push(`\nNota: ${d.message}`);

  const lead: LeadInput = {
    kind: "rental",
    name: d.name,
    email: d.email || undefined,
    phone: d.phone,
    project: "Alquiler de equipos",
    message: lines.join("\n"),
    meta: { items: d.items, dates: d.dates || "" },
  };

  try {
    await storeLead(lead);
  } catch (err) {
    console.error("storeLead error:", err);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }
  // after(): en Vercel el aviso sí se envía (el fire-and-forget se moría al responder)
  after(() => notifyLead(lead).catch((err) => console.error("notifyLead error:", err)));

  return NextResponse.json({ ok: true });
}
