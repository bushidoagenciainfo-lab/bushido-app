# Conectar Instagram al book de creadores

Sirve para que el panel traiga **seguidores reales** de cada creador y deduzca su
nicho leyendo su biografía y sus publicaciones. Es la API oficial de Meta
(*Business Discovery*), no scraping.

Se configura **una vez**. Después es un botón en `/admin`.

---

## Lo que hay que saber antes

**Solo funciona con cuentas Business o Creator.** Si el creador tiene cuenta
personal, Meta no la devuelve — no hay forma legítima de consultarla. Esas fichas
hay que llenarlas a mano (el panel te deja hacerlo).

En la práctica, casi todos los que trabajan con marcas ya tienen cuenta
profesional, así que el barrido cubre la mayoría.

---

## Paso 1 · Que @bushido.aa sea cuenta profesional

En la app de Instagram: **Configuración → Cuenta → Cambiar a cuenta
profesional** (elige *Creador* o *Empresa*).

Luego, en esa misma sección, **vincúlala a una página de Facebook** de Bushido.
Si no tienes página, créala: facebook.com/pages/create (puede estar vacía, solo
es el puente que exige Meta).

## Paso 2 · Permisos en la app de Meta

Ya tienes una app de Meta creada (la de WhatsApp). Entra a
**developers.facebook.com → tu app**.

1. **Add products** → agrega **Instagram Graph API**
2. En **App Review → Permissions**, necesitas: `instagram_basic` y
   `pages_read_engagement`
   *(en modo desarrollo funcionan sin revisión si tú eres admin de la app)*

## Paso 3 · Sacar el token y el ID

Ve al **Graph API Explorer**: developers.facebook.com/tools/explorer

1. Arriba a la derecha elige tu app
2. **Generate Access Token** → acepta los permisos `instagram_basic` y
   `pages_read_engagement`
3. Con ese token, ejecuta esta consulta (pégala en la barra del Explorer):

```
me/accounts?fields=instagram_business_account{id,username}
```

Te devuelve algo así:

```json
{ "data": [ { "instagram_business_account": { "id": "17841400000000000", "username": "bushido.aa" } } ] }
```

Ese **`id`** es tu `IG_USER_ID`.

---

## Alargar el token

El token que da el Explorer **dura 1 o 2 horas**. Hay que cambiarlo por uno
duradero o el panel dejará de funcionar el mismo día.

### Opción A · 60 días (rápida)

1. Entra a https://developers.facebook.com/tools/debug/accesstoken/
2. Pega el token en la casilla de arriba y dale **Depurar** (*Debug*)
3. Mira la fila **"Caduca"**: dirá *"en 1 hora"*
4. Baja al **final de la tabla** → botón **"Extender token de acceso"**
   (*Extend Access Token*). Si pide tu contraseña de Facebook, es normal
5. Abajo aparece un **token nuevo** — ese es el que sirve, no el de arriba
6. Para comprobar, pégalo otra vez en el depurador: "Caduca" debe decir
   *"en 2 meses"*

⚠️ A los 60 días deja de servir y el panel dirá *"Token de Instagram inválido o
vencido"*. Toca repetirlo.

### Opción B · Que no venza nunca (recomendada)

Con un **usuario del sistema**, cuyos tokens no caducan:

1. https://business.facebook.com/settings → **Usuarios → Usuarios del sistema**
   → **Agregar**
2. Nombre `bushido-ingesta`, rol **Administrador del sistema**
3. **Agregar activos**:
   - Apps → **Bushido Ingesta** → *Control total*
   - Páginas → la página vinculada a @bushido.aa → *Control total*
4. **Generar nuevo token**:
   - App: Bushido Ingesta
   - Caducidad: **Nunca**
   - Permisos: `instagram_basic`, `pages_read_engagement`, `pages_show_list`
5. **Cópialo al momento**: Facebook solo lo muestra una vez (si se pierde,
   generas otro)

---

## ⚠️ Los tokens son contraseñas

No los mandes por chat ni salgan en capturas de pantalla. Si uno se expone,
entra al Explorer y dale **Generate Access Token** de nuevo: el anterior queda
inservible.

## Qué app usar

Bushido tiene dos apps en Meta:

| App | Permisos | ¿Sirve para el book? |
|---|---|---|
| **Bushido Ingesta** | `instagram_basic`, `pages_read_engagement`, … | ✅ Sí |
| **wtb_bushido** | solo los de WhatsApp | ❌ No |

Usa **Bushido Ingesta**. Tenerlas separadas es lo correcto: si rotas el token de
WhatsApp, el book no se ve afectado.

## Paso 4 · Ponerlo en Vercel

**Vercel → proyecto bushido-app → Settings → Environment Variables**, agrega:

| Variable | Valor |
|---|---|
| `IG_USER_ID` | el id del paso 3 (solo números) |
| `IG_ACCESS_TOKEN` | el token largo |

Guarda y **Redeploy** (los cambios de variables solo entran con un despliegue
nuevo).

---

## Usarlo

En `/admin` → **Book de creadores** aparece el botón dorado
**⟳ Traer datos de Instagram**.

- Recorre las fichas incompletas que tengan Instagram
- Trae los **seguidores reales**
- Si a la ficha le falta el nicho, lo **deduce de la biografía y las últimas
  publicaciones** (esto sí usa la API de Claude, así que necesita saldo)
- Te reporta cuántas completó y cuáles fallaron, con el motivo

Si son muchas, procesa por tandas de ~45 segundos y te dice *"quedan X, vuelve a
darle"*. Dale otra vez hasta que termine.

También hay un **⟳** en cada ficha para traer solo esa.

---

## Si algo falla

| Mensaje | Qué pasa |
|---|---|
| *"Falta conectar Instagram…"* | No pusiste las variables en Vercel o no redesplegaste |
| *"no existe o es cuenta personal"* | Esa cuenta no es Business/Creator. Llénala a mano |
| *"Token de Instagram inválido o vencido"* | Se venció el token: repite el paso 3 |
| *"credit balance is too low"* | Es de Claude, no de Meta: recarga en console.anthropic.com |
