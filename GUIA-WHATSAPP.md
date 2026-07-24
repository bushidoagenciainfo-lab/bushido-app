# WhatsApp — cómo activarlo

Hay DOS mensajes distintos. Puedes activar solo el (1), o los dos.

---

## (1) Alerta a TI cuando entra un lead — GRATIS

Usa **CallMeBot** (te avisa a tu propio WhatsApp).

⚠️ **El número de CallMeBot CAMBIA con el tiempo** — NO lo fijes de memoria.
Saca el número actual + los pasos exactos de su página oficial:
👉 **https://www.callmebot.com/blog/free-api-whatsapp-messages/**

Resumen del proceso (según esa página):
1. Agrega a tus contactos el número que aparezca ahí HOY.
2. Mándale por WhatsApp el mensaje EXACTO: `I allow callmebot to send me messages`
3. Espera unos minutos (a veces tarda; es un servicio gratis/comunitario).
4. Te responde con tu **apikey**.
5. En Vercel → Environment Variables:
   - `WHATSAPP_ALERT_PHONE` = tu número con código país, ej. `573008923390` (sin +)
   - `WHATSAPP_ALERT_APIKEY` = la apikey
6. Redeploy.

> **Si CallMeBot no responde o falla** (es no-oficial): para TUS alertas internas,
> **Telegram** es más confiable y 100% gratis/oficial — dime y lo cambio en 10 min
> (creas un bot con @BotFather y listo). O simplemente usa el **aviso por correo**
> que ya funciona. Lo importante (el WhatsApp AL CLIENTE) no depende de esto.

---

## (1-bis) Respaldo por Telegram — GRATIS y confiable

Además de (o en vez de) CallMeBot, para tus alertas internas:

1. En Telegram, escribe a **@BotFather** → `/newbot` → nombre → te da un **TOKEN**.
2. Escríbele cualquier cosa a tu **bot nuevo** (para "abrir" el chat).
3. Saca tu **chat_id**: abre en el navegador
   `https://api.telegram.org/bot<TOKEN>/getUpdates` y busca `"chat":{"id":123456}`.
   (Alternativa: escribe a **@userinfobot**, te da tu id.)
4. En Vercel:
   - `TELEGRAM_BOT_TOKEN` = el token de BotFather
   - `TELEGRAM_CHAT_ID` = tu id
5. Redeploy. Cada lead te llega también por Telegram.

---

## (2) Mensaje al CLIENTE con su informe — WhatsApp Business API (Meta)

Esto **sí es oficial** y tiene un costo pequeño por conversación. WhatsApp obliga a
usar plantillas aprobadas para escribirle a números nuevos.

**Qué necesitas (una sola vez):**
1. Una cuenta de **Meta Business** (business.facebook.com) verificada.
2. En **Meta for Developers** → crea una app tipo *Business* → agrega el producto **WhatsApp**.
3. Un **número dedicado** para WhatsApp Business API (NO puede ser uno que ya uses en la app normal de WhatsApp).
4. Crea una **plantilla** (Message Templates) aprobada, por ejemplo:
   > Hola {{1}}, tu análisis de {{2}} de Bushido está listo 🎬 Míralo aquí: {{3}}
   (3 variables: nombre, marca, link)
5. Consigue: el **token permanente**, el **Phone number ID**, y el **nombre de la plantilla**.

**Luego, en Vercel:**
- `WHATSAPP_TOKEN` = token permanente
- `WHATSAPP_PHONE_ID` = Phone number ID del emisor
- `WHATSAPP_TEMPLATE` = nombre EXACTO de la plantilla
- `WHATSAPP_TEMPLATE_LANG` = `es` (o `es_CO` según cómo la crees)

Redeploy. Desde ahí, cuando un cliente pide su análisis, le llega el informe por
WhatsApp además del correo. Los parámetros que manda el código son, en orden:
**nombre, marca, link del informe** — arma la plantilla con {{1}} {{2}} {{3}} en ese orden.

> El código ya está listo. Mientras no pongas estas variables, el cliente igual
> recibe su informe por correo (no se rompe nada).
