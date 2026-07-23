# WhatsApp — cómo activarlo

Hay DOS mensajes distintos. Puedes activar solo el (1), o los dos.

---

## (1) Alerta a TI cuando entra un lead — GRATIS, 5 minutos

Usa **CallMeBot** (te avisa a tu propio WhatsApp).

1. Agrega este número a tus contactos: **+34 621 331 709** (número oficial de CallMeBot).
2. Desde tu WhatsApp, mándale este mensaje exacto:
   `I allow callmebot to send me messages`
3. Te responde con tu **apikey** (un número).
4. En Vercel → Environment Variables, pon:
   - `WHATSAPP_ALERT_PHONE` = tu número con código país, ej. `573008923390` (sin el +)
   - `WHATSAPP_ALERT_APIKEY` = la apikey que te dieron
5. Redeploy. Listo: cada lead te llega también por WhatsApp.

> Es no-oficial (un servicio gratis de la comunidad). Para alertas internas va perfecto; si algún día deja de funcionar, se cambia por Twilio.

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
