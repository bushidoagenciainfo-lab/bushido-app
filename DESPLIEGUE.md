# 🚀 Despliegue — publicar en bushidoav.com

La app **ya compila para producción** (`npm run build` ✓). Faltan 3 pasos:
subirla, publicarla en Vercel y apuntar el dominio de Hostinger.

---

## 1) Subir la última versión a GitHub
En **GitHub Desktop**:
1. Escribe un **Summary** (ej: `Fase 1-2 completo`).
2. **Commit to master** → **Push origin**.

*(Hazlo cada vez que yo agregue cambios y quieras publicarlos.)*

---

## 2) Publicar en Vercel
1. Entra a **https://vercel.com** → **Sign in with GitHub** (mismo correo).
2. **Add New… → Project** → **Import** el repo `bushido-app`.
3. Vercel detecta **Next.js** automáticamente. **No cambies nada** de build.
4. Abre **Environment Variables** y agrega las MISMAS 5 llaves de tu `.env.local`
   (una por una — Name y Value):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `LEAD_NOTIFY_EMAIL`
   - `LEAD_FROM_EMAIL`
5. **Deploy.** En ~2 min te da una URL `bushido-app-xxxx.vercel.app`. Pruébala.

> Si agregas variables DESPUÉS del primer deploy, ve a
> **Settings → Environment Variables**, agrégalas y haz **Redeploy**.

---

## 3) Conectar el dominio de Hostinger (bushidoav.com)

### 3.1 En Vercel
- Proyecto → **Settings → Domains** → escribe **`bushidoav.com`** → **Add**.
- Agrega también **`www.bushidoav.com`** (Vercel lo redirige al principal).
- Vercel te mostrará los **valores DNS exactos** a usar. Normalmente:
  - Dominio raíz `bushidoav.com` → un registro **A** → **`76.76.21.21`**
  - `www` → un registro **CNAME** → **`cname.vercel-dns.com`**
  - *(Usa SIEMPRE los valores que muestre Vercel, por si cambian.)*

### 3.2 En Hostinger
- **hPanel → Dominios → bushidoav.com → Zona DNS** (DNS / Nameservers).
- **Registro A:** Tipo `A`, Nombre `@`, Apunta a `76.76.21.21`.
  - ⚠️ Si ya existe un registro `A` para `@` (el que puso Hostinger por defecto),
    **edítalo/bórralo** y deja solo el de Vercel.
- **Registro CNAME:** Tipo `CNAME`, Nombre `www`, Apunta a `cname.vercel-dns.com`.
- **Guarda.**

### 3.3 Espera y listo
- La propagación tarda de **minutos a unas horas**. Vercel emite el **certificado
  SSL (https) automáticamente** cuando el DNS ya apunta bien.
- Cuando en Vercel → Domains aparezca **Valid Configuration** ✅, ya estás en línea
  en `https://bushidoav.com`.

---

## ⚠️ MUY IMPORTANTE — no rompas tu correo ni Resend
Tu dominio tiene otros registros que **NO debes tocar**:
- **Correo `servicios@bushidoav.com`** → NO borres los registros **MX** del dominio
  (esos son del correo, no de la web).
- **Resend** → los registros del subdominio `send.` y `resend._domainkey` son de
  Resend; déjalos.
- Solo agrega/edita el **A (`@`)** y el **CNAME (`www`)** para la web. Nada más.

---

## ✅ Checklist de despliegue
- [ ] Commit + Push en GitHub Desktop
- [ ] Proyecto importado en Vercel
- [ ] Las 5 variables de entorno agregadas en Vercel
- [ ] Deploy OK (probado en la URL .vercel.app)
- [ ] `bushidoav.com` agregado en Vercel → Domains
- [ ] Registro A (`@` → 76.76.21.21) en Hostinger
- [ ] Registro CNAME (`www` → cname.vercel-dns.com) en Hostinger
- [ ] MX del correo intactos
- [ ] Domain "Valid Configuration" ✅ + https funcionando

Cuando llegues a este punto lo revisamos juntos. Si algo sale en rojo, mándame
captura y lo destrabo.

---

## 🧯 Problema común: "Invalid Configuration" + "Failed to generate cert"

Si Vercel muestra el apex en rojo y el `www` falla el certificado, casi siempre es esto:

**1. Sobra un registro AAAA (IPv6) viejo de Hostinger que choca con la A de Vercel.**
→ En Hostinger, **BORRA** el registro `AAAA · @ · 2a02:4780:84::32`.
(Deja el `A · @ · 216.198.79.1` — ese es el de Vercel, correcto.)

**2. El `www` apunta mal.**
→ El CNAME `www` debe tener Contenido **`cname.vercel-dns.com`** (no `bushidoav.com`).
→ Si creaste por error un registro llamado `cname.vercel-dns.com`, **bórralo**.

**NO borres:** los `MX` (mx1/mx2.hostinger.com) ni el `TXT @` SPF → son tu correo.
Tampoco `send`, `resend._domainkey`, `_dmarc`, `hostingermail-*`, `autodiscover`, `autoconfig`.

Luego en Vercel → **Refresh** en las dos filas. Espera unos minutos (propagación).
