import { NextResponse } from "next/server";
import { guardarMensaje } from "@/lib/wa-inbox";
import { alertaBushidoWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

// Esta ruta la llama META, no nosotros: queda FUERA de la protección del panel
// (ver el matcher en src/proxy.ts). La seguridad la da el token de verificación
// y que Meta solo envía a la URL que tú registraste.

/**
 * Verificación inicial: Meta hace un GET con un reto y espera que le devuelvas
 * el `hub.challenge` tal cual, en texto plano.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const modo = p.get("hub.mode");
  const token = p.get("hub.verify_token");
  const reto = p.get("hub.challenge");
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN;

  if (modo === "subscribe" && esperado && token === esperado && reto) {
    return new Response(reto, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new Response("Verificación fallida", { status: 403 });
}

/** Texto legible de cualquier tipo de mensaje. */
function contenido(m: Record<string, unknown>): { texto: string; tipo: string } {
  const tipo = (m.type as string) || "text";
  const leer = (k: string, campo = "body") =>
    ((m[k] as Record<string, unknown>)?.[campo] as string) || "";

  switch (tipo) {
    case "text":
      return { texto: leer("text"), tipo };
    case "button":
      return { texto: leer("button", "text"), tipo };
    case "interactive": {
      const i = m.interactive as Record<string, Record<string, string>> | undefined;
      return { texto: i?.button_reply?.title || i?.list_reply?.title || "(respuesta)", tipo };
    }
    case "image":
    case "video":
    case "document":
      return { texto: leer(tipo, "caption") || `(envió ${tipo})`, tipo };
    case "audio":
      return { texto: "(nota de voz)", tipo };
    case "location":
      return { texto: "(ubicación)", tipo };
    default:
      return { texto: `(${tipo})`, tipo };
  }
}

/** Recibe los mensajes entrantes y los guarda en la bandeja. */
export async function POST(request: Request) {
  let body: {
    entry?: Array<{
      changes?: Array<{
        value?: {
          contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
          messages?: Array<Record<string, unknown>>;
        };
      }>;
    }>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true }); // nunca dar error a Meta
  }

  try {
    for (const entry of body.entry ?? []) {
      for (const cambio of entry.changes ?? []) {
        const v = cambio.value;
        if (!v?.messages?.length) continue; // los avisos de estado se ignoran

        const contacto = v.contacts?.[0];
        const nombre = contacto?.profile?.name ?? null;

        for (const m of v.messages) {
          const de = (m.from as string) || contacto?.wa_id;
          if (!de) continue;
          const { texto, tipo } = contenido(m);

          await guardarMensaje({
            wa_id: de,
            nombre,
            direccion: "entrante",
            texto,
            tipo,
            message_id: m.id as string,
          });

          // aviso al WhatsApp personal: si no, hay que estar mirando el panel
          await alertaBushidoWhatsApp(
            `💬 ${nombre || de} respondió:\n"${texto.slice(0, 220)}"\n\nContesta en bushidoav.com/admin`
          ).catch(() => {});
        }
      }
    }
  } catch (e) {
    console.error("[wa:webhook] error procesando:", e);
  }

  // Meta reintenta si no recibe 200 → siempre confirmamos.
  return NextResponse.json({ ok: true });
}
