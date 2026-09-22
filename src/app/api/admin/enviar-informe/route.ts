import { NextResponse } from "next/server";
import { z } from "zod";
import { emailInformeListo } from "@/lib/analisis-store";
import { sendClientWhatsApp } from "@/lib/whatsapp";
import { marcarInforme } from "@/lib/leads";

export const runtime = "nodejs";
export const maxDuration = 30;

// `nullish()`: Supabase devuelve null en los campos vacíos.
const schema = z.object({
  leadId: z.string().trim().max(80).nullish(),
  url: z.string().trim().url().max(300),
  marca: z.string().trim().min(1).max(160),
  email: z.string().trim().max(160).nullish(),
  nombre: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
});

/**
 * Le manda al cliente el informe que YA revisaste (el mismo link). Antes el
 * botón "Enviar al cliente" volvía a correr el análisis y mandaba un informe
 * nuevo, distinto del que habías leído. Protegida por la cookie del panel
 * (ver src/proxy.ts).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos.", issues: parsed.error.issues }, { status: 422 });
  }
  const { leadId, url, marca, email, nombre, phone } = parsed.data;
  // Solo links de informes de este sitio: esto le escribe a un cliente real.
  if (!/\/informe\/[\w-]+$/.test(new URL(url).pathname)) {
    return NextResponse.json({ ok: false, error: "Ese link no es un informe." }, { status: 422 });
  }

  const envio: { correo?: string; whatsapp?: string } = {};
  envio.correo = email
    ? await emailInformeListo({ email, nombre: nombre ?? undefined, marca, url }).then(
        () => "enviado",
        (e) => `falló: ${e instanceof Error ? e.message : String(e)}`
      )
    : "sin correo";
  if (phone) {
    const wa = await sendClientWhatsApp({ phone, params: [(nombre || "").split(" ")[0] || "hola", marca, url] });
    envio.whatsapp = wa.ok ? "enviado" : `falló: ${String(wa.error ?? "sin respuesta")}`;
  } else {
    envio.whatsapp = "sin número";
  }

  const salio = envio.correo === "enviado" || envio.whatsapp === "enviado";
  if (leadId && salio) await marcarInforme(leadId, { ok: true, url, origen: "panel", enviado: envio });
  return NextResponse.json({ ok: salio, envio, ...(salio ? {} : { error: "No salió por ningún canal." }) });
}
