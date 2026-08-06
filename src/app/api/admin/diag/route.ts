import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  sendClientWhatsApp,
  toWhatsAppNumber,
  hasWhatsAppAlert,
  alertaBushidoWhatsApp,
} from "@/lib/whatsapp";
import { businessDiscovery } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Diagnóstico del panel: prueba CADA pieza por separado y dice cuál falla.
 * Protegido por la cookie de admin (ver proxy.ts). Abrir: /api/admin/diag
 */
export async function GET(request: Request) {
  const out: Record<string, unknown> = {};
  // ?wa=573016706168 → envía la plantilla REAL a ese número y muestra el error de Meta
  const waTest = new URL(request.url).searchParams.get("wa");
  // ?waba=899817986501868 → lista las plantillas REALES de esa cuenta (nombre + idioma exactos)
  const wabaId = new URL(request.url).searchParams.get("waba") || process.env.WHATSAPP_WABA_ID;
  // ?ig=usuario → prueba Business Discovery contra ese perfil
  const igTest = new URL(request.url).searchParams.get("ig");

  // ── 1. Variables de entorno presentes ──
  const env = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    LEAD_FROM_EMAIL: process.env.LEAD_FROM_EMAIL || "(sin definir)",
    LEAD_NOTIFY_EMAIL: process.env.LEAD_NOTIFY_EMAIL || "(sin definir)",
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    WHATSAPP_TOKEN: !!process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || "(sin definir)",
    WHATSAPP_TEMPLATE: process.env.WHATSAPP_TEMPLATE || "(sin definir)",
    WHATSAPP_TEMPLATE_LANG: process.env.WHATSAPP_TEMPLATE_LANG || "(sin definir)",
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
  };
  out.env = env;

  // ── 2. Resend: ¿la key sirve y puede enviar? ──
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: process.env.LEAD_FROM_EMAIL || "Bushido <onboarding@resend.dev>",
        to: process.env.LEAD_NOTIFY_EMAIL || "servicios@bushidoav.com",
        subject: "Diagnóstico Bushido · prueba de correo",
        html: "<p>Si recibes esto, Resend funciona correctamente.</p>",
      });
      out.resend = error ? { ok: false, error } : { ok: true, id: data?.id };
    } catch (e) {
      out.resend = { ok: false, error: String(e) };
    }
  } else {
    out.resend = { ok: false, error: "sin RESEND_API_KEY" };
  }

  // ── 3. Supabase: ¿existe la columna `categoria` en analisis? ──
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      const { error } = await db.from("analisis").select("id, categoria").limit(1);
      out.supabase_categoria = error ? { ok: false, error: error.message } : { ok: true };
      const ev = await db.from("events").select("id").limit(1);
      out.supabase_events = ev.error ? { ok: false, error: ev.error.message } : { ok: true };
    } catch (e) {
      out.supabase_categoria = { ok: false, error: String(e) };
    }
  }

  // ── 4. Claude: ¿la key sirve? (llamada mínima) ──
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const t0 = Date.now();
      const r = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 32,
        messages: [{ role: "user", content: "Responde solo: ok" }],
      });
      out.claude = { ok: true, ms: Date.now() - t0, stop: r.stop_reason };
    } catch (e) {
      out.claude = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // ── 5. Claude + búsqueda web: ¿funciona y cuánto tarda? (el sospechoso de timeouts) ──
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const t0 = Date.now();
      await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 500,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 1 }],
        messages: [{ role: "user", content: "Busca brevemente qué es bushidoav.com" }],
      });
      out.web_search = { ok: true, ms: Date.now() - t0 };
    } catch (e) {
      out.web_search = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // ── 6. WhatsApp: ¿el token y el número sirven? ──
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}?fields=display_phone_number,verified_name,quality_rating`,
        { headers: { authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
      );
      const data = await r.json().catch(() => ({}));
      out.whatsapp = r.ok ? { ok: true, ...data } : { ok: false, error: data };
    } catch (e) {
      out.whatsapp = { ok: false, error: String(e) };
    }
  }

  // ── 6-bis. Plantillas REALES de la cuenta (nombre + idioma exactos) ──
  // El error 132001 en todos los idiomas suele significar que la plantilla vive
  // en OTRA cuenta de WhatsApp (WABA) distinta a la del número emisor.
  if (process.env.WHATSAPP_TOKEN && wabaId) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${wabaId}/message_templates?fields=name,language,status,category&limit=50`,
        { headers: { authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
      );
      const data = await r.json().catch(() => ({}));
      out.plantillas = r.ok
        ? {
            ok: true,
            waba: wabaId,
            total: data?.data?.length ?? 0,
            lista: (data?.data ?? []).map(
              (t: { name: string; language: string; status: string; category: string }) =>
                `${t.name} · ${t.language} · ${t.status} · ${t.category}`
            ),
          }
        : { ok: false, waba: wabaId, error: data };
    } catch (e) {
      out.plantillas = { ok: false, error: String(e) };
    }
  } else {
    out.plantillas =
      "Para ver las plantillas reales: /api/admin/diag?waba=TU_ID_DE_CUENTA_WHATSAPP_BUSINESS";
  }

  // ── 7. Envío REAL de la plantilla de WhatsApp (solo si pasas ?wa=numero) ──
  if (waTest) {
    out.whatsapp_envio = {
      numero_recibido: waTest,
      numero_normalizado: toWhatsAppNumber(waTest),
      resultado: await sendClientWhatsApp({
        phone: waTest,
        params: ["Maick", "Bushido", "https://bushidoav.com/informe/demo"],
      }),
    };
  } else {
    out.whatsapp_envio = "Para probar el envío: /api/admin/diag?wa=573016706168";
  }

  // ── 7b. Alertas a MI WhatsApp/Telegram cuando entra un lead ──
  const alertPhone = process.env.WHATSAPP_ALERT_PHONE;
  const alertKey = process.env.WHATSAPP_ALERT_APIKEY;
  const alertas: Record<string, unknown> = {
    whatsapp_personal: hasWhatsAppAlert()
      ? "configurado ✓"
      : `FALTA: ${!alertPhone ? "WHATSAPP_ALERT_PHONE " : ""}${!alertKey ? "WHATSAPP_ALERT_APIKEY" : ""}`.trim(),
    telegram: process.env.TELEGRAM_BOT_TOKEN
      ? process.env.TELEGRAM_CHAT_ID
        ? "configurado ✓"
        : "FALTA TELEGRAM_CHAT_ID"
      : "FALTA TELEGRAM_BOT_TOKEN",
    como_activar_whatsapp:
      "1) Agrega +34 621 33 33 11 a tus contactos. 2) Mándale por WhatsApp: " +
      "'I allow callmebot to send me messages'. 3) Te responde con tu apikey. " +
      "4) En Vercel: WHATSAPP_ALERT_PHONE=573016706168 y WHATSAPP_ALERT_APIKEY=esa_clave. 5) Redeploy.",
  };
  // ?alerta=1 → manda una alerta de prueba a tu WhatsApp personal
  if (new URL(request.url).searchParams.get("alerta")) {
    if (hasWhatsAppAlert()) {
      await alertaBushidoWhatsApp("🔔 Prueba de alerta desde el panel de Bushido.");
      alertas.envio_prueba = "enviada — revisa tu WhatsApp";
    } else {
      alertas.envio_prueba = "no se pudo: falta configurar (ver arriba)";
    }
  } else {
    alertas.envio_prueba = "Para probar: /api/admin/diag?alerta=1";
  }
  out.alertas_de_lead = alertas;

  // ── 7c. Bandeja de WhatsApp: ¿existe la tabla y están llegando mensajes? ──
  const bandeja: Record<string, unknown> = {
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN ? "puesto ✓" : "FALTA",
    url_del_webhook: "https://bushidoav.com/api/whatsapp/webhook",
  };
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const c = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      const { count, error } = await c
        .from("wa_mensajes")
        .select("id", { count: "exact", head: true });
      if (error) {
        bandeja.tabla = /does not exist|schema cache/i.test(error.message)
          ? "❌ NO EXISTE — corre supabase/wa_mensajes.sql en Supabase → SQL Editor"
          : `❌ ${error.message}`;
      } else {
        bandeja.tabla = "existe ✓";
        bandeja.mensajes_guardados = count ?? 0;
        if ((count ?? 0) === 0) {
          bandeja.diagnostico =
            "La tabla está vacía: Meta aún no ha entregado nada. Revisa en la app de Meta → " +
            "WhatsApp → Configuración → Webhook, que el campo 'messages' esté SUSCRITO y que " +
            "la app esté en modo Activo. Luego mándate un WhatsApp al número de Bushido.";
        }
        const { data: ultimos } = await c
          .from("wa_mensajes")
          .select("created_at, wa_id, nombre, direccion, texto")
          .order("created_at", { ascending: false })
          .limit(3);
        if (ultimos?.length) bandeja.ultimos = ultimos;
      }
    } catch (e) {
      bandeja.tabla = `no se pudo comprobar: ${e instanceof Error ? e.message : e}`;
    }
  } else {
    bandeja.tabla = "sin Supabase configurado";
  }
  out.bandeja_whatsapp = bandeja;

  // ── 8. Instagram Business Discovery (book de creadores) ──
  const igUser = process.env.IG_USER_ID;
  const igTok = process.env.IG_ACCESS_TOKEN;
  const ig: Record<string, unknown> = {
    IG_USER_ID: igUser ? `puesto (${igUser})` : "FALTA",
    IG_ACCESS_TOKEN: igTok ? `puesto (${igTok.length} caracteres)` : "FALTA",
  };

  if (igUser && igTok) {
    const v = process.env.IG_GRAPH_VERSION || "v21.0";

    // 8a. ¿El token qué permisos tiene y cuándo vence?
    try {
      const r = await fetch(
        `https://graph.facebook.com/${v}/debug_token?input_token=${encodeURIComponent(igTok)}&access_token=${encodeURIComponent(igTok)}`
      );
      const d = (await r.json()) as {
        data?: {
          scopes?: string[];
          expires_at?: number;
          type?: string;
          application?: string;
          is_valid?: boolean;
        };
        error?: { message?: string };
      };
      if (d.data) {
        // Business Discovery exige instagram_manage_insights ADEMÁS de los
        // básicos: es el permiso que habilita leer datos de OTRAS cuentas.
        const faltan = [
          "instagram_basic",
          "pages_read_engagement",
          "instagram_manage_insights",
        ].filter((p) => !(d.data?.scopes ?? []).includes(p));
        ig.token = {
          valido: d.data.is_valid,
          app: d.data.application,
          tipo: d.data.type,
          vence: d.data.expires_at
            ? new Date(d.data.expires_at * 1000).toLocaleString("es-CO")
            : "nunca",
          permisos: d.data.scopes,
          PERMISOS_QUE_FALTAN: faltan.length ? faltan : "ninguno ✓",
        };
      } else {
        ig.token = d.error?.message ?? d;
      }
    } catch (e) {
      ig.token = `no se pudo inspeccionar: ${e instanceof Error ? e.message : e}`;
    }

    // 8b. ¿El IG_USER_ID es de verdad una cuenta de Instagram business?
    try {
      const r = await fetch(
        `https://graph.facebook.com/${v}/${igUser}?fields=id,username,name,followers_count&access_token=${encodeURIComponent(igTok)}`
      );
      const d = await r.json();
      ig.cuenta = d?.error
        ? `❌ ${d.error.message} — ¿seguro que ese ID es el de la CUENTA DE INSTAGRAM y no el de la página de Facebook? Sácalo con: me/accounts?fields=instagram_business_account{id,username}`
        : d;
    } catch (e) {
      ig.cuenta = `no se pudo consultar: ${e instanceof Error ? e.message : e}`;
    }

    // 8c. ¿Qué cuentas de Instagram ve este token? (la respuesta al ID correcto)
    try {
      const r = await fetch(
        `https://graph.facebook.com/${v}/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${encodeURIComponent(igTok)}`
      );
      ig.paginas_y_cuentas_ig = await r.json();
    } catch (e) {
      ig.paginas_y_cuentas_ig = `no se pudo consultar: ${e instanceof Error ? e.message : e}`;
    }

    // 8d. Prueba real de Business Discovery
    ig.prueba = await businessDiscovery(igTest || "bushido.aa");
  }
  out.instagram = ig;

  return NextResponse.json(out, { status: 200 });
}
