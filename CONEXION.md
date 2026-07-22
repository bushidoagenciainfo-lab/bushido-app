# 🔌 Guía de conexión — Bushido

Sigue estos pasos en orden. Al terminar, cada lead del formulario llegará a tu
**correo** y quedará guardado en tu **base de datos**.

> Tú creas las cuentas y pegas las llaves en `.env.local`. Yo (Claude) nunca veo
> esas llaves. **Nunca** las compartas ni subas `.env.local` a git (ya está protegido).

Tiempo estimado: **20–25 min**.

---

## ✅ PASO 1 — Supabase (base de datos)

1. Entra a **https://supabase.com** → **Start your project** → crea cuenta (con GitHub o email).
2. **New project**:
   - **Name:** `bushido`
   - **Database Password:** genera una y **guárdala** (la vas a necesitar solo si administras la DB directo).
   - **Region:** `South America (São Paulo)` ← el más cercano a Colombia.
   - Create new project. Espera ~2 minutos a que se aprovisione.
3. **Crea las tablas:** menú izquierdo → **SQL Editor** → **New query** →
   abre el archivo `bushido-app/supabase/schema.sql`, **copia todo** y pégalo → **Run**.
   Debe decir *Success*. (Crea la tabla `leads` con seguridad activada.)
4. **Copia las llaves:** engranaje **Project Settings** → **API**:
   - **Project URL** → esto va en `SUPABASE_URL`
   - En **Project API keys**, la llave **`service_role`** (dice *secret* / *reveal*) → va en `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ La `service_role` es SECRETA y solo se usa en el servidor. Nunca la pongas en el navegador ni la compartas.

---

## ✅ PASO 2 — Resend (correo automático)

1. Entra a **https://resend.com** → crea cuenta.
2. **API Keys** → **Create API Key**:
   - Name: `bushido`
   - Permission: **Sending access**
   - Copia la llave (empieza con `re_…`) → va en `RESEND_API_KEY`
3. **Para la primera prueba (rápido):** deja el remitente por defecto
   `Bushido <onboarding@resend.dev>` (ya está en el ejemplo). En modo prueba,
   Resend solo entrega a **el correo con el que te registraste**, así que pon ese
   mismo correo en `LEAD_NOTIFY_EMAIL` para ver el email llegar.
4. **Para producción (tu dominio):** menú **Domains** → **Add Domain** → `bushidoav.com`
   → Resend te muestra unos registros DNS (TXT/DKIM, etc.).
   - Ve a **Hostinger → hPanel → Dominios → Zona DNS** y agrega esos registros.
   - Vuelve a Resend → **Verify**. Cuando quede verificado, cambia:
     - `LEAD_FROM_EMAIL=Bushido <servicios@bushidoav.com>`
     - `LEAD_NOTIFY_EMAIL=servicios@bushidoav.com`

---

## ✅ PASO 3 — Poner las llaves en `.env.local`

Abre una terminal en la carpeta `bushido-app` y crea el archivo:

```powershell
Copy-Item .env.example .env.local
```

Abre `.env.local` en tu editor y rellena:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   (la service_role)
RESEND_API_KEY=re_xxxxxxxx
LEAD_NOTIFY_EMAIL=tu-correo@ejemplo.com    (para la 1ª prueba: tu correo de Resend)
LEAD_FROM_EMAIL=Bushido <onboarding@resend.dev>
```

Guarda. **Reinicia el servidor** (`Ctrl+C` y de nuevo `npm run dev`) para que
tome las variables.

---

## ✅ PASO 4 — Probar que todo llega

1. Abre **http://localhost:3000** → baja a **“Análisis gratis”**.
2. Llena el formulario con un correo real tuyo → **Quiero mi análisis**.
3. Verifica:
   - **Base de datos:** Supabase → **Table Editor** → tabla **`leads`** → aparece la fila. ✅
   - **Correo:** revisa tu bandeja (y spam la primera vez) → llega el aviso de Bushido. ✅

Si algo falla, mira la consola donde corre `npm run dev`: los errores dicen
exactamente qué pasó (llave mal pegada, dominio sin verificar, etc.). Pásamelos y lo resolvemos.

---

## 🚀 (Después) PASO 5 — Vercel + dominio

Cuando terminemos Fase 1 y quieras subirlo a `bushidoav.com`:

1. Sube `bushido-app` a un repositorio en **GitHub**.
2. **Vercel** → **Import Project** → elige el repo → en **Environment Variables**
   pega las MISMAS llaves del `.env.local`.
3. Deploy. Vercel te da una URL de prueba.
4. **Dominio:** en Vercel agregas `bushidoav.com` y te da un registro DNS; lo pones
   en **Hostinger → Zona DNS** (un CNAME/A). En minutos queda en tu dominio.

Te acompaño en vivo cuando llegue el momento.

---

### 🔒 Recordatorio de seguridad
- `.env.local` **nunca** se sube a git (ya está en `.gitignore`).
- La llave `service_role` de Supabase y el `RESEND_API_KEY` son secretas — solo en `.env.local` y en Vercel (Environment Variables).
- Si alguna se filtra, regenérala desde su panel.

---

## 📦 Extra — Bucket para CVs (banco de talentos)

Para que el CV del banco de talentos se guarde, crea un bucket en Supabase:
1. Supabase → **Storage** → **New bucket** → nombre **`cv`** → márcalo **Public** → Create.
2. Listo: los CV subidos quedan ahí y su link llega en el correo del lead.
   (Sin bucket, la postulación igual se guarda; solo no se sube el archivo.)
