# 🧭 Guía detallada — de cero a en línea (Bushido)

Hecha para seguir paso a paso sin conocimientos técnicos.
Correo del proyecto: **bushido.agencia.info@gmail.com**

---

## 🗺️ PRIMERO: el mapa (qué es cada cosa)

Son **4 herramientas separadas**. Cada una hace UNA cosa:

| Herramienta | Qué hace | ¿Se conecta a GitHub? |
|---|---|---|
| **GitHub** | El “closet” donde vive el código. | — |
| **Vercel** | El servidor que **publica** la web en internet. Lee el código de GitHub. | ✅ SÍ |
| **Supabase** | La **base de datos**: guarda los leads y los CVs. | ❌ No (solo inicias sesión con GitHub) |
| **Resend** | El **cartero**: envía el correo de aviso cuando llega un lead. | ❌ No |

Cómo se conectan de verdad:

```
   GitHub (código)
        │
        ▼
   Vercel  ──►  publica la web en  bushidoav.com
        │
        ├──►  Supabase   (guarda leads + CVs)
        └──►  Resend     (envía el correo de aviso)
```

**La confusión típica:** Supabase y Resend NO se “vinculan a GitHub”.
Lo único que hacen es **darte unas llaves** (unos textos largos). Esas llaves
las pegas en 2 lugares:
1. En tu computador, en un archivo `.env.local` → para probar en local.
2. En Vercel (Environment Variables) → para que funcione ya publicado.

Eso es todo. GitHub ↔ Vercel es el único “enlace” real.

---

## ✅ PASO A — Subir el código a GitHub

El código está en tu computador (`bushido-app`). Hay que subirlo a GitHub para
que Vercel lo pueda leer.

**Opción fácil (GitHub Desktop):**
1. Instala **GitHub Desktop** (desktop.github.com) e inicia sesión con
   `bushido.agencia.info@gmail.com`.
2. **File → Add Local Repository** → elige la carpeta `bushido-app`.
3. Arriba dice “Publish repository” → nómbralo `bushido-app`, márcalo **Private**
   → **Publish**.
4. Listo: tu código ya está en GitHub.

**Opción terminal (si prefieres):** dentro de `bushido-app`:
```powershell
git add -A
git commit -m "Bushido app - fase 1"
```
Luego crea un repo vacío en github.com (botón **New**, nombre `bushido-app`,
Private) y sigue las 2 líneas que GitHub te muestra (`git remote add origin ...`
y `git push -u origin main`).

---

## ✅ PASO B — Supabase (la base de datos) — DETALLADO

Aquí es donde te confundiste. Vamos despacio.

1. Entra a **https://supabase.com** → **Sign in** → puedes usar **Continue with GitHub**.
2. Si te pide crear una **organización**: nómbrala `Bushido`, plan **Free**.
3. Botón **New project**:
   - **Name:** `bushido`
   - **Database Password:** haz clic en **Generate a password** y **guárdala** en tus
     notas (por si algún día administras la base directo; para la web no la necesitas).
   - **Region:** elige **South America (São Paulo)** (el más cercano a Colombia).
   - **Create new project.** Espera ~2 minutos (aparece “Setting up project…”).

4. **Crear las tablas (donde caen los leads):**
   - Menú izquierdo → **SQL Editor** → **+ New query**.
   - Abre en tu editor el archivo `bushido-app/supabase/schema.sql`, **copia TODO** el
     contenido y **pégalo** en ese cuadro.
   - Botón **Run** (abajo a la derecha). Debe decir **Success. No rows returned**.
   - ✔️ Con esto ya existe la tabla `leads`.

5. **Crear el espacio para los CVs (banco de talentos):**
   - Menú izquierdo → **Storage** → **New bucket**.
   - Nombre: **`cv`** (exactamente así, en minúscula).
   - Activa **Public bucket** (para poder abrir el CV desde el correo).
   - **Create bucket.**

6. **Copiar las 2 llaves** (esto es lo que va en el proyecto):
   - Menú izquierdo abajo → **Project Settings** (el engranaje) → **API**.
   - **Project URL** → copia ese link (`https://xxxx.supabase.co`).
     → esto es `SUPABASE_URL`.
   - Baja a **Project API keys** → busca la que dice **`service_role`** →
     haz clic en **Reveal** → copia ese texto larguísimo.
     → esto es `SUPABASE_SERVICE_ROLE_KEY`.
   - ⚠️ La `service_role` es una **llave maestra secreta**. Solo va en `.env.local`
     y en Vercel. Nunca la pegues en un chat, ni en el navegador, ni la compartas.
   - *(Si tu Supabase muestra un sistema nuevo de llaves con “Publishable / Secret”,
     copia entonces una llave **Secret** — cumple la misma función.)*

**¿Qué es cada llave?**
`SUPABASE_URL` = la dirección de tu base de datos.
`SUPABASE_SERVICE_ROLE_KEY` = la llave que le permite al servidor **escribir** ahí.

---

## ✅ PASO C — Resend (el correo) — ya tienes la API

1. Ya tienes tu **API key** de Resend (empieza con `re_…`).
   → esa es `RESEND_API_KEY`. ✔️
2. **Modo prueba (importante):** mientras NO verifiques tu dominio, Resend solo
   entrega correos a **la dirección con la que te registraste**
   (`bushido.agencia.info@gmail.com`).
   → Por eso, para la primera prueba, usa:
   ```
   LEAD_NOTIFY_EMAIL=bushido.agencia.info@gmail.com
   LEAD_FROM_EMAIL=Bushido <onboarding@resend.dev>
   ```
3. **Después, para enviar desde tu dominio** (`servicios@bushidoav.com`):
   - Resend → **Domains** → **Add Domain** → `bushidoav.com`.
   - Resend te da unos registros (TXT/DKIM). Ponlos en
     **Hostinger → hPanel → Dominios → Zona DNS**.
   - Vuelve a Resend → **Verify**. Cuando quede verde, cambia a
     `LEAD_FROM_EMAIL=Bushido <servicios@bushidoav.com>` y
     `LEAD_NOTIFY_EMAIL=servicios@bushidoav.com`.

---

## ✅ PASO D — Pegar las llaves y probar en tu computador

1. En la carpeta `bushido-app`, crea el archivo de llaves:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Abre `.env.local` y rellénalo con lo que copiaste:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (la service_role, muy larga)
   RESEND_API_KEY=re_xxxxxxxx
   LEAD_NOTIFY_EMAIL=bushido.agencia.info@gmail.com
   LEAD_FROM_EMAIL=Bushido <onboarding@resend.dev>
   ```
   Guarda el archivo.
3. **Reinicia el servidor** para que tome las llaves: en la terminal donde corre,
   `Ctrl + C` y de nuevo:
   ```powershell
   npm run dev
   ```
4. **Prueba:** abre **http://localhost:3000** → clic en **Análisis gratis** →
   llena el formulario con tu correo → **Quiero mi análisis**.
   - En Supabase → **Table Editor** → tabla **`leads`** → debe aparecer la fila. ✅
   - En tu Gmail (revisa **spam** la 1ª vez) → llega el aviso de Bushido. ✅

Si algo no llega, mira la terminal de `npm run dev`: el error dice exactamente
qué pasó. Cópiamelo y lo arreglamos.

---

## ✅ PASO E — Vercel (publicar en bushidoav.com)

*(Esto lo hacemos juntos cuando estés listo; queda documentado.)*

1. **https://vercel.com** → **Sign in with GitHub** (con el mismo correo).
2. **Add New → Project** → **Import** el repo `bushido-app`.
3. Vercel detecta que es **Next.js** solo. Antes de **Deploy**, abre
   **Environment Variables** y agrega las **mismas 5 llaves** del `.env.local`
   (una por una: nombre y valor). → **Deploy**.
4. Te da una URL `bushido-app-xxxx.vercel.app` para probar.
5. **Tu dominio:** proyecto → **Settings → Domains** → agrega `bushidoav.com`.
   Vercel te muestra un registro DNS (un **A** o **CNAME**). Ponlo en
   **Hostinger → Zona DNS**. En unos minutos queda en tu dominio.

---

## 🧯 Si algo falla (rápido)

| Problema | Causa probable |
|---|---|
| El lead no aparece en Supabase | Llaves mal pegadas, o no corriste `schema.sql`. |
| No llega el correo | En modo prueba solo llega a tu correo de Resend; revisa spam. |
| El CV no se sube | Falta crear el bucket `cv` (Paso B.5). |
| Error 500 al enviar | Mira la terminal de `npm run dev` y pásame el mensaje. |

---

## ☑️ Checklist

- [ ] Código subido a GitHub (Paso A)
- [ ] Proyecto Supabase creado (Paso B.1–B.3)
- [ ] `schema.sql` ejecutado → tabla `leads` (Paso B.4)
- [ ] Bucket `cv` creado (Paso B.5)
- [ ] Copiadas `SUPABASE_URL` y `service_role` (Paso B.6)
- [ ] `RESEND_API_KEY` a la mano (Paso C)
- [ ] `.env.local` creado y lleno (Paso D)
- [ ] Prueba local OK: lead en la tabla + correo recibido (Paso D.4)
- [ ] (Después) Vercel + dominio (Paso E)
