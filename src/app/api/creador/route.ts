import { NextResponse, after } from "next/server";
import { z } from "zod";
import { storeCreador } from "@/lib/creadores";
import { notifyLead } from "@/lib/leads";
import { alertaBushidoWhatsApp } from "@/lib/whatsapp";
import { alertaTelegram } from "@/lib/telegram";
import { forwardToServer } from "@/lib/forward";
import { enviarAlOS } from "@/lib/bushido-os";

export const runtime = "nodejs";

const schema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().max(160).optional(),
  telefono: z.string().trim().max(40).optional(),
  ciudad: z.string().trim().max(80).optional(),
  nichos: z.array(z.string().max(60)).max(6).optional(),
  formatos: z.array(z.string().max(60)).max(10).optional(),
  instagram: z.string().trim().max(200).optional(),
  tiktok: z.string().trim().max(200).optional(),
  youtube: z.string().trim().max(200).optional(),
  seguidores: z.coerce.number().int().min(0).max(100_000_000).optional(),
  tarifa: z.string().trim().max(120).optional(),
  notas: z.string().trim().max(1000).optional(),
  portafolio: z.string().trim().max(300).optional(),
  website_hp: z.string().max(0).optional(), // honeypot
});

/** Registro público al book de creadores UGC / influencers. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }
  const { website_hp, ...c } = parsed.data;
  if (website_hp) return NextResponse.json({ ok: true }); // bot

  try {
    await storeCreador(c);
  } catch (err) {
    console.error("storeCreador error:", err);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu perfil. Intenta de nuevo." },
      { status: 500 }
    );
  }

  after(async () => {
    forwardToServer("lead", { tipo: "creador", ...c }).catch(() => {});
    // al cerebro: el book alimenta el Creator Matching por nicho
    enviarAlOS("/api/sync", { tipo: "creadores", total: 1, items: [c] }).catch(() => {});
    const resumen =
      `🎬 Nuevo creador UGC\n${c.nombre}${c.ciudad ? " · " + c.ciudad : ""}\n` +
      `${(c.nichos ?? []).join(", ")}\n${c.instagram || ""} ${c.tiktok || ""}`;
    await alertaBushidoWhatsApp(resumen);
    await alertaTelegram(resumen);
    await notifyLead({
      kind: "talento",
      name: c.nombre,
      email: c.email,
      phone: c.telefono,
      role: `Creador UGC · ${(c.nichos ?? []).join(", ")}`,
      social: [c.instagram, c.tiktok, c.youtube].filter(Boolean).join(" · "),
      portfolio: c.portafolio,
      message: [c.tarifa ? `Tarifa: ${c.tarifa}` : "", c.notas].filter(Boolean).join(" · "),
      meta: { formatos: c.formatos, seguidores: c.seguidores, ciudad: c.ciudad },
    }).catch((e) => console.error("notify creador:", e));
  });

  return NextResponse.json({ ok: true });
}
