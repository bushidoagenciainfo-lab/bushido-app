# Bandeja de WhatsApp en el panel

El número de Bushido está en la Cloud API de Meta, así que **no se puede abrir en
la app del celular** (por eso sale "suspendido" al intentarlo). Esta bandeja es
la forma de ver y responder lo que contesta la gente.

Se configura una vez. Son dos pasos: la tabla y el webhook.

---

## Paso 1 · La tabla

En **Supabase → SQL Editor**, ejecuta el contenido de
`supabase/wa_mensajes.sql`. Crea la tabla donde se guardan las conversaciones.

## Paso 2 · Una clave que tú inventas

En **Vercel → Settings → Environment Variables**:

| Variable | Valor |
|---|---|
| `WHATSAPP_VERIFY_TOKEN` | invéntate una palabra, ej. `bushido-webhook-2026` |

No es una clave de nadie: es solo para que Meta y tu sitio se reconozcan. Guarda
y **Redeploy**.

## Paso 3 · Conectar el webhook en Meta

1. Entra a **developers.facebook.com → tu app `wtb_bushido`**
2. Menú izquierdo → **WhatsApp → Configuración** (*Configuration*)
3. En **Webhook**, dale **Editar** (*Edit*) y pon:

| Campo | Valor |
|---|---|
| **URL de devolución de llamada** | `https://bushidoav.com/api/whatsapp/webhook` |
| **Token de verificación** | la misma palabra del paso 2 |

4. **Verificar y guardar**. Si la clave coincide, Meta acepta al instante.
   Si dice "no se pudo validar", revisa que hiciste el Redeploy.

5. Abajo, en **Campos del webhook** (*Webhook fields*), dale **Administrar** y
   **activa `messages`**. ⚠️ Sin esto Meta acepta el webhook pero no te manda
   nada — es el error más común.

---

## Cómo se usa

En `/admin` aparece la sección **WhatsApp**, con el número de mensajes sin leer.

- La lista de la izquierda son las conversaciones
- Al abrir una, ves el hilo completo y puedes responder
- **✦ Sugerir respuesta** redacta un borrador usando la conversación y el
  análisis de esa persona. **No envía nada**: lo lees, lo ajustas y tú decides
- Cuando alguien responde, además te llega un aviso a tu WhatsApp personal

## La ventana de 24 horas

Regla de Meta, no nuestra:

- Cuando alguien te escribe, se abren **24 horas** para responder lo que quieras
- Pasadas esas 24 horas, Meta bloquea el texto libre hasta que la persona vuelva
  a escribir

La bandeja te muestra en cada conversación cuánto tiempo te queda
(*"puedes responder · 18h restantes"*) o si ya se cerró. **Es la razón por la
que hay que contestar el mismo día.**

## Si no aparece nada

| Síntoma | Causa |
|---|---|
| La sección dice que no hay conversaciones | Falta activar el campo `messages` en Meta (paso 3.5) |
| Meta no valida el webhook | El `WHATSAPP_VERIFY_TOKEN` no coincide, o falta el Redeploy |
| "No se pudo enviar: pasaron más de 24 horas" | Es la ventana de Meta, no un error |
| Todo funciona pero no llegan avisos al celular | Falta `WHATSAPP_ALERT_PHONE` / `WHATSAPP_ALERT_APIKEY` |
