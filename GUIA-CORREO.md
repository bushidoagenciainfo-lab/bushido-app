# ✉️ Guía para configurar el correo (Resend)

Objetivo: que cada solicitud del formulario **te llegue por correo**.
Correo del proyecto: **bushido.agencia.info@gmail.com**

---

## 🧠 Lo que hay que entender primero

El correo lo envía **Resend** (el "cartero"). Para que funcione hay que darle
la llave `RESEND_API_KEY` **en dos lugares distintos**:

| Dónde | Para qué |
|---|---|
| `.env.local` (en tu computador) | Que funcione cuando pruebas en **localhost** |
| **Vercel** (Environment Variables) | Que funcione en el sitio **en vivo (bushidoav.com)** |

⚠️ **Por esto no te llegó el correo:** el `.env.local` NO lo ve Vercel.
El sitio en vivo necesita las llaves **en Vercel**.

Además, hay **2 modos** de Resend:
- **Modo prueba** (sin verificar dominio): Resend **solo entrega a tu propio
  correo de Resend** (`bushido.agencia.info@gmail.com`). Sirve para probar ya.
- **Modo producción** (dominio verificado): puede enviar **desde**
  `servicios@bushidoav.com` y **a cualquier correo** (incluida la auto-respuesta al cliente).

---

## ✅ PASO 1 — Poner las llaves en VERCEL (esto arregla lo del sitio en vivo)

1. Entra a **https://vercel.com** → tu proyecto **bushido-app**.
2. **Settings** → **Environment Variables**.
3. Agrega estas variables (una por una — Name y Value), marcadas para
   **Production, Preview y Development**:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | tu llave `re_…` |
   | `LEAD_NOTIFY_EMAIL` | `bushido.agencia.info@gmail.com` |
   | `LEAD_FROM_EMAIL` | `Bushido <onboarding@resend.dev>` |
   | `SUPABASE_URL` | tu Project URL de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | tu llave `service_role` de Supabase |

4. Ve a la pestaña **Deployments** → en el último, menú **⋯** → **Redeploy**
   (las variables solo aplican tras un nuevo deploy).

---

## ✅ PASO 2 — Probar

1. Abre **bushidoav.com** → pide un análisis (llena el formulario).
2. Revisa **bushido.agencia.info@gmail.com** — bandeja de entrada **y SPAM**
   (la primera vez casi siempre cae en spam).
3. ¿Llegó? 🎉 Ya funciona el aviso.

**Verifica también la base de datos:** Supabase → **Table Editor** → tabla
**`leads`** → debe aparecer la fila. (Si aparece la fila pero no el correo →
el problema es solo Resend; revisa el PASO 1 y el spam.)

---

## ✅ PASO 3 — (Recomendado) Enviar desde tu dominio `servicios@bushidoav.com`

Para que el correo salga desde tu dominio **y** para que el **cliente reciba la
auto-respuesta con su estimado**, hay que **verificar el dominio en Resend**:

1. Resend → **Domains** → **Add Domain** → `bushidoav.com`.
2. Resend te muestra **3 registros** (normalmente): un **MX**, un **TXT (SPF)** y
   un **TXT/CNAME (DKIM)**.
3. Agrégalos en **Hostinger → hPanel → Dominios → Zona DNS**
   (⚠️ NO borres tus MX de correo `mx1/mx2.hostinger.com` — los de Resend van en
   el subdominio `send`, no chocan).
4. Vuelve a Resend → **Verify DNS Records**. Puede tardar minutos a un par de horas.
5. Cuando quede **verificado (verde)**, cambia en **Vercel**:
   - `LEAD_FROM_EMAIL` → `Bushido <servicios@bushidoav.com>`
   - `LEAD_NOTIFY_EMAIL` → `servicios@bushidoav.com`
   - **Redeploy**.

Desde ese momento: el aviso llega a `servicios@bushidoav.com` y el cliente
recibe su correo de "recibimos tu solicitud + estimado".

---

## 🧯 Si no llega

| Síntoma | Causa / solución |
|---|---|
| No llega nada, ni a gmail | Faltan las variables en **Vercel** (Paso 1) o no hiciste **Redeploy**. |
| No llega pero sí aparece en Supabase | Solo falta Resend: revisa `RESEND_API_KEY` en Vercel y el **spam**. |
| Llega a gmail pero no a servicios@ | Estás en **modo prueba** → verifica el dominio (Paso 3). |
| El cliente no recibe su auto-respuesta | Igual: en modo prueba solo llega a tu correo Resend → verifica el dominio. |

> Para probar en tu computador (localhost), pon las mismas variables en
> `.env.local` y reinicia `npm run dev`.
