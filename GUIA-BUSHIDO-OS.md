# Conectar la web con Bushido OS

El sitio **capta**. El OS **analiza y cruza**. Esta es la lista de lo que el
sitio le manda y qué debe existir del otro lado.

## Configuración (una vez)

En Vercel → Environment Variables (ya deberían estar, las usa `/api/lead`):

| Variable | Qué es |
|---|---|
| `BUSHIDO_OS_URL` | La dirección del OS, ej. `https://os.bushidoav.com` |
| `SITIO_WEB_SECRET` | Clave compartida; viaja en el header `x-bushido-sitio` |

Todo sale desde el **servidor** del sitio, nunca desde el navegador: el secreto
no se expone.

---

## Endpoints que el OS debe tener

### 1. `POST /api/prospectos/entrada` *(ya existía)*
Cada vez que alguien pide el análisis gratis.

```json
{ "nombre_negocio": "...", "ig_handle": "@...", "tiktok_handle": "@...",
  "contacto": "correo · teléfono", "objetivo": "Manejo de redes", "brief": "..." }
```

### 2. `POST /api/brief` *(nuevo — onboarding)*
Cuando un cliente llena `bushidoav.com/brief`. Objeto plano con las claves que
haya llenado, de estas 30:

`nombre` `sector` `ciudad` `tiempo` `web` `redes` `contacto` · `origen`
`diferencial` · `cliente_ideal` `cliente_real` `objeciones` · `productos`
`estrella` `precios` `temporada` · `personalidad` `emocion` `palabras`
`no_decir` · `vocero` `camara` `voz_vocero` · `referentes` `competencia`
`comp_analisis` · `objetivos` `pauta` `material` `extra`

`nombre` siempre viene. `camara` es uno de: `Muy cómodo` `Normal` `Incómodo`
`Sin vocero`. `pauta` es uno de: `Nunca` `Poco` `Regular` `Fuerte`.

### 3. `POST /api/sync` *(nuevo — la data acumulada)*
Un solo endpoint para todo. Siempre con la misma forma:

```json
{ "tipo": "creadores" | "analisis" | "nichos" | "leads",
  "total": 49,
  "items": [ ... ] }
```

**`creadores`** — el book: `id, nombre, ciudad, instagram, tiktok, nichos[],
formatos[], seguidores, tarifa, estado, notas`.
Sirve para el Creator Matching: cruzar la marca con el creador que más encaja.

**`analisis`** — cada diagnóstico completo: `marca, nicho, categoria, resumen,
fortalezas[], carencias[], oportunidades[], buyer_persona, emociones[],
emociones_detalle[], canales[], metricas[], propuesta, paquete, estado`.
Es la materia prima del cerebro.

**`nichos`** — lo que el sitio ya calculó por categoría: `categoria, total,
marcas[], temasFortaleza[], temasCarencia[], emociones[], canalesFlojos[]`.
Útil para comparar contra lo que el OS ya sabe.

**`leads`** — la demanda: `kind, empresa, redes, proyecto, mensaje, estado`.
Muestra qué se pide y desde qué sector.

**Respuesta esperada:** cualquier `2xx`. Si devuelves JSON, el panel lo muestra.

**Importante:** los envíos se repiten (la sincronización manual manda todo otra
vez). Deduplica por `id` de tu lado.

---

## Cómo se usa

**Automático** — sin hacer nada:
- Lead nuevo → `/api/prospectos/entrada`
- Análisis generado → `/api/sync` con ese análisis
- Creador registrado → `/api/sync` con ese creador
- Brief enviado → `/api/brief`

**Manual** — `/admin` → sección **Bushido OS** → **⇪ Sincronizar**:
manda todo lo acumulado (book, análisis, nichos, leads) de una vez. Úsalo la
primera vez y cuando quieras reprocesar.

Si el OS está caído, el sitio sigue funcionando: la data ya quedó en Supabase y
se puede reenviar con el botón.

---

## Lo que falta (el camino de vuelta)

Hoy el sitio **envía** pero no **lee** del OS. Cuando el cerebro tenga
conclusiones que valga la pena mostrar —patrones entre nichos, qué formato está
funcionando este mes, qué creador recomienda para una marca— el siguiente paso
es un `GET` del OS que el panel consuma.

---

## Migración pendiente en Supabase (informe abrebocas)

El informe que pide un desconocido por el pop-up ahora es un **abrebocas**: dos
fortalezas, una carencia completa y el dato de su sector. Eso necesita cuatro
columnas nuevas en la tabla `analisis`. **Mientras no las crees, el sitio sigue
funcionando** —el informe se guarda igual— pero *sin* el dato de sector y sin
recordar que era la versión corta, así que el prospecto vería el informe
completo.

Corre esto una vez en Supabase → **SQL Editor**:

**Primero comprueba cómo se llama la tabla y en qué proyecto está.** Si el SQL
te responde `relation "analisis" does not exist`, es una de dos: estás en otro
proyecto de Supabase, o la tabla tiene otro nombre. Esto te lo dice:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema not in ('pg_catalog', 'information_schema')
order by table_schema, table_name;
```

Busca en la lista la tabla de análisis. Si aparece con otro nombre o en otro
esquema, usa ese en el `alter table` de abajo. Si no aparece ninguna, estás en
el proyecto equivocado: compara la URL del proyecto con `SUPABASE_URL` en
Vercel → Settings → Environment Variables.

Con el nombre confirmado:

```sql
alter table analisis
  add column if not exists dato_sector      jsonb,
  add column if not exists cierre_gancho    text,
  add column if not exists sector           jsonb,
  add column if not exists modo             text default 'completo',
  add column if not exists con_datos_reales boolean;
```

Los informes que ya existen quedan como `completo`, que es lo que son.

**Cómo saber si falta:** en los logs de Vercel aparece
`[analisis] faltan columnas nuevas en Supabase`.

### Ver el informe completo de un lead

El enlace `/informe/<id>` es uno solo y muestra dos cosas distintas:

- **El prospecto** ve el abrebocas.
- **Tú**, con la sesión de `/admin` abierta en ese navegador, ves el informe
  completo en ese mismo enlace, con un aviso al pie recordándote la diferencia.

Es el enlace que abres en la llamada de venta. No hay una URL secreta que se
pueda filtrar: lo que manda es tu sesión.
