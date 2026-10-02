# Auditoría bushidoav.com — 1 de octubre de 2026

Sitio auditado en vivo (Vercel) + código fuente de `bushido-app/`. Páginas recorridas: Home, Portafolio, Servicios (con drawer), Gremio, Equipos, Descargables, Contacto, página 404, y vista móvil 375×812. Métricas tomadas con el navegador (Performance API) y revisión de `globals.css`, componentes y rutas.

**Impacto:** Alto = pierde clientes hoy · Medio = frena conversión · Bajo = pulido.
**Esfuerzo:** Rápido = horas · Medio = 1–3 días · Largo = 1+ semana.

> **ESTADO · 1 oct 2026 (misma noche): implementado en `bushido-app` (pendiente commit + push + redeploy).**
>
> **Hecho:** pop-up por intención (50 % scroll / 25 s / exit-intent, 7 días, excluido en contacto, equipos, brief, 404; barra inferior en móvil; 5 campos) · WhatsApp flotante con mensaje por página + footer · hero con fotograma real 1920 px, línea concreta y prueba enlazada · home nueva (marcas → trabajo seleccionado con video en hover → manifiesto → sistema en 4 pasos → prueba + informe demo → servicios resumen → cierre doble) · nav con página activa y "Cotizar" separado de "Análisis gratis" · servicios en español, 4 grupos abiertos, "1 servicio", drawer con "Pedir propuesta" → contacto preseleccionado + WhatsApp + escasez · portafolio: arco solo destacados, 56 portadas WebP `<img>` lazy con alt (4,6 MB → 185 KB), reels arriba, lightbox → WhatsApp, bloque "showreel" eliminado · 404 propia · `opengraph-image` + Twitter card · Vercel Analytics + evento `conversion` · validación de teléfono (API y cliente) · selector de país oculto tras "¿Otro país?" · estado de éxito con WhatsApp y portafolio · CSS: `:active` 120 ms, hover gated en táctil, tap-highlight, inputs 16 px, focus-visible, skip-link, targets ≥ 44 px, drawer con curva iOS, lightbox con entrada, sin `transition: all`.
>
> **Pendiente de Maick (datos que solo él tiene):** (1) link del reel de 43,4 M → `HERO_PROOF.url` en `src/lib/site.ts`; (2) 2–3 testimonios reales → `TESTIMONIOS` en el mismo archivo (la sección aparece sola); (3) clip definitivo del hero → `USE_VIDEO = true` en `Hero.tsx`; (4) fuente Anton del wordmark (`--brut`) sigue sin cargarse: dejar `anton.woff2` en `public/fonts` o aceptar Impact; (5) activar Web Analytics en el panel de Vercel para que `@vercel/analytics` reporte.

---

## 1. DISEÑO Y EXPERIENCIA VISUAL

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **La home no muestra ni una sola imagen o video.** Cero `<img>`, hero en degradado (video apagado), manifiesto, 8 pasos de texto y un formulario. Una agencia audiovisual que no muestra trabajo en los primeros 3 segundos pierde credibilidad al instante. | Alto | Hero con montaje mudo de 3–4 clips reales (6–8 s, ≤2,5 MB, con póster) o al menos una franja de 6 trabajos destacados debajo del hero (video + foto, mezcla conciertos/moda/contenido). | Medio |
| 2 | **El pop-up tapa el hero a los 0,9 s** (`AUTO_OPEN_MS = 900`). El visitante no alcanza a leer el titular; lo primero que ve es un formulario de 8 campos. Reaparece cada 3 días. También se abre en la página 404. | Alto | Disparar por intención: al 50 % de scroll, a los 20–25 s, o exit-intent en desktop. Nunca en `/contacto`, `/equipos` ni 404. Ver propuesta en sección B. | Rápido |
| 3 | **Jerarquía desktop correcta, pero plana.** Instrument Serif + bone/sepp/gold se sostienen bien; el problema es que todas las secciones son texto sobre tinta sin ninguna textura visual intermedia. | Medio | Alternar secciones: texto → trabajo → texto → prueba. Grano y hairlines ya existen; úsalos para separar bloques de distinta naturaleza. | Medio |
| 4 | **Portafolio duplica las 56 piezas dos veces** (arco + grilla, la misma lista completa). Página de 7.447 px en desktop y 8.607 px en móvil; descarga 4,6 MB de portadas al abrir. | Medio | El arco muestra solo las 8–10 `featured`; la grilla, todo con filtros. Portadas en WebP con `loading="lazy"` (ver eje 5). | Medio |
| 5 | **El portafolio lee como portafolio de fotos.** Cada tarjeta dice "10 FOTOS"; solo 6 de 56 proyectos tienen video y los reels están escondidos dentro del lightbox. Bushido vende video. | Alto | Badge "VIDEO" / "REEL" visible en la tarjeta; hover reproduce clip mudo en las que tengan video; los 8 reels sueltos de adidas/Nike van arriba, no al final. | Medio |
| 6 | **Responsive funciona:** sin overflow horizontal, h1 a 40 px en 2 líneas, botones del hero 215×56 px, modal en bottom-sheet scrolleable, arco móvil con scroll horizontal. | — | Nada que corregir estructuralmente. Solo lo del eje 3 (targets pequeños e inputs 15 px). | — |
| 7 | **Velocidad percibida en home es buena:** 274 KB, carga completa 1,08 s, TTFB 0,69 s. | — | Mantener. El riesgo está en portafolio (4,6 MB). | — |
| 8 | **Nav sin estado activo.** No hay forma de saber en qué página estás; `Nav.tsx` no usa `usePathname`. Tampoco aparecen Equipos ni Descargables (solo vía Gremio). | Bajo | `aria-current="page"` + subrayado sepp; en el menú móvil listar las 6 rutas. | Rápido |

## 2. COMUNICACIÓN Y COPY

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **El titular no dice qué haces ni para quién.** "Hacemos lo que la gente recuerda" es un lema, no una promesa. Solo el eyebrow aclara "Agencia audiovisual · Bogotá". El sub es filosófico ("saber cuál vale la pena producir"). | Alto | Mantener el lema (ya es la voz de la marca), pero agregar una línea concreta debajo: *"Video, foto y contenido para marcas y artistas que necesitan vender, no solo publicar."* Y una fila de logos/nombres: adidas, Nike, New Era, Red Bull, Feid, J Balvin, Forbes. | Rápido |
| 2 | **La prueba social del hero (43,4 M vistas · 2,7 M cuentas · 1,7 M me gusta) no tiene evidencia.** No se dice qué pieza, para quién, ni hay link. Un número grande sin contexto se lee como inventado. | Alto | Enlazar al reel real (Instagram o YouTube) y nombrarlo: *"Reel para X · ver pieza →"*. Si hay captura de Insights, mostrarla en el lightbox. | Rápido |
| 3 | **Servicios en inglés y con jerga para un público colombiano:** Intelligence, Growth Systems, Creative Production, Amplification, "Kansei", "jobs-to-be-done", "always-on", "full-funnel", "buyer personas". Un dueño de panadería (Bianco, Bears) no entiende qué compra. | Alto | Nombres en español con beneficio: *Inteligencia (sabemos qué producir) · Crecimiento en redes (contenido mensual que vende) · Producción (videoclips, eventos, campañas, foto) · Amplificación (creators y pauta)*. Jerga solo en el drawer, explicada en una línea. | Rápido |
| 4 | **Mismo argumento repetido dos veces en la home:** "Un reel suelto no es estrategia, es un gasto" aparece en Manifiesto y en El sistema. | Bajo | Dejarlo en el manifiesto; que El sistema arranque directo con los pasos. | Rápido |
| 5 | **Ratio tú/nosotros aceptable en hero y cotización**, pero El sistema (8 pasos) habla de Bushido 8 veces seguidas sin un solo resultado para el cliente. | Medio | Comprimir a 4 pasos visibles (Analizamos → Decidimos → Producimos → Medimos) con los 8 como detalle expandible, y cerrar cada paso con "qué ganas tú". | Medio |
| 6 | **Cero testimonios, cero casos con resultado.** 56 proyectos y ninguna frase de un cliente ni un "antes/después" de métricas. | Alto | 3 testimonios reales (Bianco, Mindo, un artista/manager) con nombre y cargo; 1 caso con cifra (el reel de 43 M). Formato: una cita grande, no carrusel de 3 tarjetas. | Medio |
| 7 | **Todos los CTA dicen lo mismo** ("Análisis gratis", "Pide tu análisis", "Quiero mi análisis", "Pedir propuesta", "Quiero algo así", "Pedir acceso") y todos abren el mismo formulario de análisis de redes. Quien quiere cotizar un videoclip termina llenando "Instagram (obligatorio)". | Alto | Dos intenciones, dos destinos: **Cotizar** (form de cotización o WhatsApp con texto prellenado por servicio) y **Análisis gratis** (lead magnet). Ver sección B. | Medio |
| 8 | **"Pedir acceso al showreel completo, reservado para clientes que dejan sus datos"** abre el formulario de análisis y no existe ningún showreel que se entregue. Es una promesa falsa. | Alto | O se monta un showreel real (YouTube/Vimeo no listado, se envía por email tras el form) o se elimina el bloque. | Rápido |
| 9 | **Error gramatical visible:** "1 SERVICIOS" en los grupos de Servicios. | Bajo | Singular/plural condicional. | Rápido |

## 3. FUNCIONALIDAD Y LIMPIEZA

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **Sin página 404 propia.** Muestra el default de Next en inglés ("This page could not be found.") con el nav de Bushido y el pop-up encima. | Medio | `src/app/not-found.tsx` con marca, 3 enlaces (Portafolio, Servicios, WhatsApp) y sin pop-up. | Rápido |
| 2 | **Ningún botón tiene estado `:active`** (0 reglas en 3.807 líneas de CSS). Al tocar, nada responde hasta que el navegador navega. En móvil se siente lento aunque cargue rápido. | Medio | `.btn:active, button:active { transform: scale(.97); transition: transform 120ms var(--e-out) }`. | Rápido |
| 3 | **96 reglas `:hover` sin `@media (hover: hover)`.** En celular el hover se queda pegado después del tap (botón que sigue "iluminado", flecha desplazada). | Medio | Envolver los hover en `@media (hover: hover) and (pointer: fine)`. | Rápido |
| 4 | **Sin `-webkit-tap-highlight-color: transparent`.** Flash gris de navegador en cada tap sobre tarjetas y botones. | Bajo | Una línea en `html`. | Rápido |
| 5 | **Inputs a 15 px en móvil** (`.field input` font-size 15px). iOS Safari hace zoom al enfocar y no vuelve. | Medio | `@media (pointer: coarse) { input, select, textarea { font-size: 16px } }`. | Rápido |
| 6 | **Targets táctiles pequeños:** CTA del nav 35 px de alto; links del footer 12–15 px de alto; link de política de datos 12 px. Mínimo recomendado 44 px. | Medio | Padding vertical en nav-cta y links del footer; separar los legales en líneas propias en móvil. | Rápido |
| 7 | **Página `/brief` huérfana:** no está enlazada desde ningún lado ni en el sitemap, pero es indexable con título "Formulario de onboarding". | Bajo | Si es para clientes ya cerrados, `robots: noindex`; si es pública, enlazarla desde Contacto. | Rápido |
| 8 | **Validación de teléfono inexistente en API** (`phone: z.string().max(40)`): acepta "hola". El form público tampoco valida formato. | Bajo | Regex de 7–15 dígitos tras limpiar espacios; mensaje inline. | Rápido |
| 9 | **Selector de 20 países** en todos los formularios de una agencia que dice "Base · Bogotá · Servicio nacional". Ruido visual y una decisión más para el usuario. | Bajo | +57 fijo con enlace "¿Otro país?" que despliega el selector. | Rápido |
| 10 | **Formularios: lo que sí está bien.** Estados loading/error/éxito, honeypot, texto legal, Zod en servidor, envío instantáneo con `after()`. Sin errores de consola en ninguna página (solo un warning de API deprecada de Performance). | — | Mantener. | — |
| 11 | **`transition: all`** en 2 reglas y transiciones de `width` en 5 (animan layout, no composición). | Bajo | Especificar propiedades; preferir `transform`/`opacity`. | Rápido |

## 4. INTERACCIÓN CON EL PÚBLICO

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **WhatsApp casi no existe.** Cero enlaces `wa.me` en Home, Portafolio, Servicios y Gremio. Solo aparece en Contacto (1 link) y en el carrito de Equipos. Para el mercado colombiano, WhatsApp es el canal número uno. | Alto | Botón flotante persistente (abajo derecha, 56 px, sepp) con mensaje prellenado según la página: en Servicios *"Hola, me interesa [servicio]"*; en Portafolio *"Vi el trabajo de [cliente] y quiero algo así"*. Y en el footer. | Rápido |
| 2 | **Clics para cotizar:** desde la home, 1 clic abre el modal de análisis (no cotización). Para pedir un videoclip: Servicios → abrir grupo (+) → Ver paquetes → drawer → "Pedir propuesta" → abre… el formulario de análisis de redes. 5 clics y termina en el lugar equivocado. | Alto | "Pedir propuesta" en el drawer debe ir a cotización con el servicio y paquete preseleccionados, o a WhatsApp con texto prellenado. 2 clics máximo. | Medio |
| 3 | **Pop-up pide 8 campos (5 obligatorios, Instagram incluido)** para un "regalo de bienvenida". Es más que el formulario de cotización. | Alto | 4 campos: Nombre, WhatsApp, Instagram, ¿Qué buscas? Email opcional (el informe también puede llegar por WhatsApp; hoy va por email, así que si el email sigue siendo obligatorio, quitar Empresa). | Rápido |
| 4 | **Feedback de envío correcto:** "¡Listo! Recibimos tu solicitud. Te enviamos la propuesta en menos de 24h." Pero el estado de éxito es un callejón sin salida. | Medio | En el éxito: *"¿Prefieres que hablemos ya? Abrir WhatsApp →"* + link a portafolio. Trackear el evento de conversión. | Rápido |
| 5 | **Lead magnet existe y es bueno** (análisis gratis con informe automático por IA). Pero es el único gancho y se empuja igual a quien quiere comprar hoy. | Medio | Añadir un segundo gancho de baja fricción para el que no está listo: los Descargables (LUTs, presets) ya capturan correo; promocionarlos en la home como "regalo" en vez del pop-up agresivo. | Rápido |
| 6 | **Redes vinculadas** (Instagram, TikTok, YouTube) con handles reales en el footer, pero el contenido del sitio no embebe nada de ellas. | Bajo | Embeber 3 reels (oEmbed de Instagram) en la sección de prueba. | Medio |
| 7 | **CTA en cada sección:** la home tiene CTA en hero y cotización, pero Manifiesto y El sistema (la mitad de la página) no tienen ninguno. | Medio | Cerrar El sistema con *"Empieza por el paso 01 · análisis gratis →"* y poner el flotante de WhatsApp. | Rápido |
| 8 | **Equipos:** el flujo carrito → WhatsApp está bien resuelto (sin pago en línea, claro). | — | Mantener. | — |

## 5. SEO Y VISIBILIDAD BÁSICA

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **Sin imagen Open Graph ni Twitter Card.** Cuando alguien comparte bushidoav.com por WhatsApp o Instagram, el preview sale sin imagen. Para una agencia audiovisual es lo peor que puede pasar en un share. | Alto | `src/app/opengraph-image.tsx` (1200×630, marca + fotograma real) y `twitter: { card: "summary_large_image" }` en el layout. Por página: portafolio con collage, servicios con precios. | Rápido |
| 2 | **Cero imágenes indexables.** Todo el portafolio va en `background-image` inline: sin `alt`, sin `srcset`, sin lazy loading, invisible para Google Imágenes. | Medio | Migrar portadas a `<img>` con `alt="Ferxxo en vivo — fotografía de concierto por Bushido"`, `loading="lazy"`, `decoding="async"`, WebP. (Next `<Image>` opcional; `next/image` no se usa en ningún lado.) | Medio |
| 3 | **Títulos y descripciones:** bien en 8 de 9 páginas. `/descargables` no tiene description. `/brief` indexable sin querer. | Bajo | Agregar description; noindex en brief. | Rápido |
| 4 | **Estructura h1/h2 lógica** en todas las páginas; `lang="es"`; JSON-LD `ProfessionalService` con teléfono, redes y Bogotá; robots.ts y sitemap.ts correctos; favicon presente. | — | Mantener. Añadir `@type: Service` por servicio con `offers.price` para rich results. | Medio |
| 5 | **Carga < 3 s:** sí en home (1,08 s). Portafolio descarga 4,6 MB en desktop (56 portadas JPG a la vez). | Medio | Lazy + WebP + arco solo con featured (ver 1.4). Meta: < 1,5 MB inicial. | Medio |
| 6 | **Sin analítica de tráfico.** No hay GA4 ni Vercel Analytics; solo la tabla propia `events` con 8 eventos. No sabes de dónde llega la gente ni qué porcentaje convierte. | Alto | Activar Vercel Analytics (1 paquete, 0 config) o pegar el `GA_MEASUREMENT_ID`. Marcar conversión en el éxito del formulario. | Rápido |
| 7 | **Fuente display `Anton`** declarada en `--brut` pero sin `@font-face` ni link: cae a Impact/Arial Narrow según el equipo. | Bajo | Cargarla local en `public/fonts` como las demás, o quitar la variable. | Rápido |

## 6. ESTRATEGIA Y CONVERSIÓN

| # | Hallazgo | Impacto | Qué hacer | Esfuerzo |
|---|----------|---------|-----------|----------|
| 1 | **El sitio tiene un objetivo claro (capturar leads para el análisis), pero lo persigue a costa de la venta directa.** Todo embudo lleva al lead magnet; no hay camino corto para el que ya quiere comprar. | Alto | Dos embudos explícitos: **Comprar** (Servicios → propuesta/WhatsApp) y **Explorar** (análisis gratis / descargables). Nav: "Cotizar" y "Análisis gratis" como dos botones distintos. | Medio |
| 2 | **El recorrido no muestra la mercancía.** Llega → lee un lema → lee filosofía → lee 8 pasos → formulario. En ningún punto ve un video. El portafolio está a un clic pero nadie llega si el pop-up lo sacó antes. | Alto | Home: Hero → Logos → Trabajo seleccionado → Sistema (corto) → Prueba (caso + testimonios) → Servicios resumen → Cotizar. | Medio |
| 3 | **Sin razón para actuar hoy.** El "cupos limitados · pocas marcas nuevas al mes" solo vive dentro del informe generado; en el sitio no hay ninguna urgencia ni fecha. | Medio | En Servicios y en el drawer: *"Tomamos 4 marcas nuevas al mes · quedan X para noviembre"* (manual desde admin). En one-offs: *"Reserva tu fecha con el 30 %"*. Sin descuentos (coherente con el posicionamiento premium). | Rápido |
| 4 | **Diferenciación real existe pero no se prueba:** "criterio antes que equipo", "producir es lo último", informe con IA, data de nichos. Son afirmaciones; la demo está escondida en `/informe/demo`. | Alto | Enlazar el informe demo desde la home ("Así se ve el análisis que te entregamos →"). Es la prueba más contundente del método y hoy nadie la ve. | Rápido |
| 5 | **Lo que pasa después del formulario sí tiene sistema** (notificación, informe automático, email al cliente, panel admin, estados de lead). Pero el usuario no lo percibe. | Medio | Decirlo en el éxito y en el copy del modal: *"En menos de 24 h recibes un informe con tus gatillos, emociones y un plan. Así se ve →"*. La promesa concreta multiplica la tasa de llenado. | Rápido |
| 6 | **Precios públicos:** acierto. Transparencia poco común en el sector y filtra curiosos. Riesgo: la sección "Growth Systems" arranca en $2.500.000/mes sin explicar en lenguaje simple qué recibe el cliente por eso. | Medio | En cada paquete: "qué recibes al mes" en 3 bullets concretos (piezas, reuniones, informe). | Rápido |

---

## RESUMEN EJECUTIVO

**Lo que funciona.** La base técnica es sólida: Next 16 en Vercel, carga en 1 segundo, cero errores de consola, formularios con validación y estados, SEO estructural correcto (títulos, robots, sitemap, JSON-LD), precios públicos, responsive sin roturas, y un sistema de postventa real (informe automático con IA, panel admin, estados de lead) que ninguna agencia pequeña del mercado tiene. La identidad visual (serif editorial sobre tinta, rojo sepp, grano) es propia y no parece plantilla.

**Lo más urgente.** El sitio de una agencia audiovisual no muestra ningún video ni foto en la home, y antes del primer segundo tapa el titular con un formulario de 8 campos. Además, todos los botones del sitio, incluido "Pedir propuesta" dentro de un servicio con precio, desembocan en el mismo formulario de análisis de redes. Quien llega con plata para un videoclip no tiene un camino para pedirlo. WhatsApp, el canal que de verdad cierra ventas en Colombia, aparece en una sola página. Y al compartir el enlace no sale imagen.

**La oportunidad desaprovechada.** Bushido tiene 56 proyectos con adidas, Nike, New Era, Red Bull, Feid, J Balvin, Sam Smith y Forbes, un reel de 43 millones de vistas y un informe de diagnóstico automatizado que se puede ver en vivo. Nada de eso está en la primera pantalla. Poner la prueba delante de la filosofía (logos, trabajo, caso, informe demo) convierte el discurso de "criterio" en algo que se ve, y eso vale más que cualquier rediseño.

## TOP 5 ACCIONES INMEDIATAS

1. **Mover el pop-up a intención** (50 % scroll o 25 s o exit-intent, nunca en 404/Contacto) y bajarlo a 4 campos. Es el cambio con más impacto por hora invertida.
2. **Separar "Cotizar" de "Análisis gratis":** "Pedir propuesta" del drawer → formulario de cotización con servicio preseleccionado o WhatsApp prellenado. Botón flotante de WhatsApp en todas las páginas con mensaje por contexto.
3. **Mostrar trabajo en la home:** fila de logos/nombres de clientes + 6 trabajos destacados con video. Enlazar el reel de 43 M y el informe demo desde el hero/prueba.
4. **`opengraph-image.tsx` + Twitter card + Vercel Analytics.** Media hora de trabajo; arregla cómo se ve cada share y te da datos de tráfico desde mañana.
5. **Español en Servicios** (grupos y jerga), eliminar o cumplir la promesa del "showreel completo", y crear `not-found.tsx` con marca.

---

# PROPUESTA DE MEJORA: DISEÑO E INTERACCIÓN

Basada en las skills instaladas (`design-taste-frontend`, `redesign-existing-projects`, `emil-design-eng`, `mobile-native`). Regla de las skills que aplica aquí: **no reescribir, mejorar lo que hay.** El sistema visual se conserva; cambia qué se muestra, en qué orden y cómo responde al tacto.

**Design Read:** landing de agencia creativa, editorial cinematográfico oscuro, audiencia = dueños y gerentes de marca colombianos + managers de artistas. Dials: densidad baja, movimiento medio (decorativo solo en hero y portafolio; UI rápida), superficie = tinta con grano, un solo acento (sepp) y dorado reservado a prueba/precio.

## A. Arquitectura nueva de la home

| Orden | Sección | Qué cambia |
|---|---|---|
| 1 | **Hero** | Se conserva el lema y la tipografía. Debajo del sub, una línea concreta (qué/para quién). Fondo: montaje mudo de 3–4 clips de 2 s cada uno, 720p, ≤2,5 MB, con póster; si no hay clip aún, un fotograma fijo real (Ferxxo o Adidas Samba) con el velo actual, nunca degradado solo. Prueba social enlazada a la pieza real. |
| 2 | **Franja de marcas** | Una línea tipográfica en mono/caps, sin logos pesados: `adidas · Nike · New Era · Red Bull · Feid · J Balvin · Sam Smith · Forbes Colombia`. Scroll horizontal lento (marquee lineal) solo en desktop; estático en móvil. |
| 3 | **Trabajo seleccionado** | 6 piezas `featured` en grilla asimétrica (2 grandes + 4 medianas, no 3 columnas iguales). Las que tienen video reproducen en hover (desktop) / al entrar en viewport (móvil, mudo). Badge VIDEO/REEL. CTA "Ver los 56 proyectos →". |
| 4 | **El sistema** | 4 pasos visibles con cierre "qué ganas tú"; los 8 originales como detalle expandible. Entrada escalonada (stagger 60 ms, translateY 12 px + opacity, 220 ms). |
| 5 | **Prueba** | Una cita grande de cliente (no carrusel), el caso de 43 M con el reel embebido, y el enlace "Así se ve el análisis que te entregamos → /informe/demo". |
| 6 | **Servicios resumen** | 4 tarjetas en español con "desde $X" y un bullet de beneficio. Click → /servicios con el grupo abierto. |
| 7 | **Cierre doble** | Izquierda: "Cotiza tu proyecto" (form actual). Derecha: "¿Aún no sabes qué necesitas? Pide el análisis gratis". El visitante elige su puerta. |

## B. Estrategia de CTA y pop-up

- **Dos intenciones, dos verbos en todo el sitio:** `Cotizar →` (sepp, sólido) y `Análisis gratis →` (ghost). Nunca más de un sólido por pantalla.
- **Mapa de destinos:** nav "Cotizar" → `/contacto#form`; nav "Análisis gratis" → modal. Drawer "Pedir propuesta" → `/contacto?servicio=videoclip&paquete=con-concepto` con el select prellenado, y un segundo link "o escríbenos por WhatsApp" con texto `Hola Bushido, me interesa Videoclip · Con concepto ($3.900.000)`. Portafolio "Quiero algo así" → WhatsApp con el nombre del proyecto. "Pedir acceso al showreel" → eliminar hasta tener showreel.
- **Pop-up:** disparo por `scroll ≥ 50 %` o `25 s` o `mouseleave` hacia arriba (desktop). Excluir `/contacto`, `/equipos`, `/brief`, 404 y cuando el drawer esté abierto. 4 campos. Reaparece a los 7 días, no 3. En móvil, en vez de modal completo, una barra inferior de 64 px ("Análisis gratis de tus redes · Pedirlo →") que expande el sheet al tocar.
- **WhatsApp flotante:** 56×56 px, sepp, esquina inferior derecha, `padding-bottom: env(safe-area-inset-bottom)`, oculto cuando modal/drawer/lightbox están abiertos. Texto prellenado por ruta.
- **Estado de éxito:** título sin signo de exclamación ("Listo. Te escribimos en menos de 24 h."), promesa concreta del informe, botón WhatsApp y link a portafolio. Evento `conversion` trackeado.

## C. Pulido de interacción (formato Antes / Después)

| Antes | Después | Por qué |
|---|---|---|
| Ningún `:active` en botones | `.btn:active, .svc-cat:active, .pg-card:active { transform: scale(.97) }` con `transition: transform 120ms var(--e-out)` | El botón debe responder al presionar, no al soltar; en táctil es la única confirmación. |
| 96 `:hover` globales | Envueltos en `@media (hover: hover) and (pointer: fine) { … }` | Evita el hover pegado tras el tap en móvil. |
| Sin `-webkit-tap-highlight-color` | `html { -webkit-tap-highlight-color: transparent }` | Quita el flash gris del navegador que pelea con el feedback propio. |
| `.field input { font-size: 15px }` | `@media (pointer: coarse) { input, select, textarea { font-size: 16px } }` | iOS hace zoom con menos de 16 px y no vuelve. |
| `transition: all 0.22s` (×2) | `transition: color .2s, border-color .2s, background .2s` | `all` anima propiedades que no quieres y cuesta frames. |
| `transition: width .5s` (×5) | Usar `transform: scaleX()` con `transform-origin: left` | `width` relayouta cada frame; `transform` va por GPU. |
| `transform 0.5s` y `0.9s` en elementos de UI | UI ≤ 250 ms; 0.5–0.9 s solo en hero (subrayado) y arco del portafolio | Lo que el usuario ve muchas veces al día debe ser rápido; lo decorativo puede ser lento. |
| Drawer de servicios con `--e-out` genérico | `transition: transform 320ms cubic-bezier(.32,.72,0,1)` (curva iOS de drawer) y `overscroll-behavior: contain` en su scroll | Curva pensada para paneles laterales; el scroll interno no arrastra la página. |
| Lightbox aparece sin entrada definida | Entra con `opacity 0→1` + `scale(.96→1)` en 200 ms ease-out; sale en 150 ms | Nada aparece desde la nada; entrada más rápida que salida. |
| Nav sin indicador de página | `aria-current="page"` + hairline sepp de 1 px bajo el link, `transition: transform 180ms` con `scaleX` | El usuario sabe dónde está; el subrayado animado da sensación de sistema. |
| `:focus` solo en inputs | `:focus-visible { outline: 2px solid var(--bone); outline-offset: 3px }` global para links y botones | Accesibilidad por teclado sin ensuciar el click con mouse. |
| Pasos del sistema montan todos a la vez | `IntersectionObserver` + stagger 60 ms, `translateY(12px)→0`, 220 ms | Cascada corta guía el ojo sin volverse espectáculo. |
| Footer links 12–15 px de alto | `padding: 10px 0; display: inline-block` → ≥ 44 px de área táctil | Target mínimo recomendado en móvil. |
| Botón flotante inexistente | `.wa-fab { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)) }` | No lo tapa la barra de gestos de iOS/Android. |

## D. Portafolio

- **Una lista, dos vistas:** arco = 8–10 `featured`; grilla = las 56 con filtros. Elimina el duplicado y baja la página a la mitad.
- **Portadas como `<img>`** con `alt` descriptivo, `loading="lazy"`, `decoding="async"`, WebP de 800 px (hoy JPG de hasta 300 KB). El script `scripts/portafolio.mjs` ya genera las carpetas; añadir conversión a WebP.
- **Video primero:** badge en tarjeta, hover-play en desktop (`<video muted playsinline preload="none">` cargado solo al hover), reels sueltos arriba de la grilla con el embed de Instagram.
- **Lightbox:** CTA único "Quiero algo así → WhatsApp" con el nombre del proyecto; quitar "Pedir acceso".
- **Móvil:** el arco horizontal ya funciona; agregar `scroll-snap-type: x mandatory` y `touch-action: pan-x` para que no pelee con el scroll vertical.

## E. Servicios

- Grupos en español (ver eje 2.3) y los 4 abiertos como tiles en desktop (2×2), acordeón solo en móvil.
- Corregir "1 SERVICIOS".
- En cada paquete: 3 bullets "qué recibes" + "para quién es".
- Drawer: CTA sólido "Pedir propuesta" → cotización preseleccionada; link secundario WhatsApp; nota de escasez ("Tomamos 4 marcas nuevas al mes") editable desde admin.

## F. Checklist móvil nativo (del skill `mobile-native`)

```css
html { -webkit-tap-highlight-color: transparent; }
html, body { overscroll-behavior: none; }
.modal-form-wrap, .drawer-body, .lb-stage { overscroll-behavior: contain; }
button, a, [role="button"] { touch-action: manipulation; user-select: none; -webkit-touch-callout: none; }
@media (pointer: coarse) { input, select, textarea { font-size: 16px; } }
.hero-v2 { min-height: 100svh; }   /* ya está: conservar */
.modal, .wa-fab { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

Y en `layout.tsx`: `viewport.viewportFit = "cover"` para que `env()` tenga valor.

## G. SEO y entrega

- `src/app/opengraph-image.tsx` (marca + fotograma) y `twitter.card = "summary_large_image"`.
- `src/app/not-found.tsx` con marca, 3 enlaces y sin pop-up.
- `metadata.robots = { index: false }` en `/brief`; description en `/descargables`.
- Vercel Analytics (`@vercel/analytics`) en el layout; evento `conversion` en éxito de formularios.
- Cargar `Anton` local o quitar `--brut`.

## Hoja de ruta sugerida

| Cuándo | Qué | Resultado esperado |
|---|---|---|
| **Esta semana (rápido)** | Pop-up por intención + 4 campos · WhatsApp flotante + footer · OG image + Analytics · 404 · español en Servicios · quitar "showreel" · `:active`, hover gating, tap-highlight, inputs 16 px · enlazar reel 43 M e informe demo | Deja de perder al visitante en el primer segundo; aparece el canal que cierra; cada share lleva imagen; empiezas a medir. |
| **Semanas 2–3 (medio)** | Home nueva (logos, trabajo seleccionado, prueba, cierre doble) · CTA "Cotizar" separado con preselección · portafolio una lista + `<img>` lazy WebP + badges video · drawer con WhatsApp y escasez | El sitio muestra la mercancía y da un camino corto al que quiere comprar. |
| **Mes (largo)** | Hero con montaje de video definitivo · testimonios y caso con cifras · hover-play y embeds de reels · `Service` JSON-LD con precios | Prueba visible de "criterio" y diferenciación medible en búsqueda y shares. |
