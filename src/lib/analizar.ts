// Motor de análisis de Bushido — corre el framework de las 7 maletas con la
// API de Claude y devuelve un `Analisis` estructurado listo para la plantilla.
//
// Requiere ANTHROPIC_API_KEY (ponla en Vercel → Environment Variables). Si no
// está configurada, generarAnalisis() devuelve null (no rompe: el resto del
// pipeline sigue funcionando, solo no se genera el informe automático).

import Anthropic from "@anthropic-ai/sdk";
import { businessDiscovery, hasInstagram } from "./instagram";
import { EMOCIONES, NICHOS, type Analisis, type EmocionDetalle, type Emocion, type Nicho } from "./analisis";

export interface AnalizarInput {
  marca: string; // nombre de la empresa/marca (del lead: company)
  redes?: string; // Instagram / @handles (del lead: social)
  tiktok?: string; // TikTok (opcional; puede tener otro @ que Instagram)
  web?: string;
  contexto?: string; // qué busca el cliente + notas extra
  /**
   * MODO PROFUNDO: busca la marca en la web antes de analizar (+35s).
   * OFF por defecto: el análisis gratis debe llegar RÁPIDO (es el gancho).
   * Úsalo desde el panel para clientes que ya contrataron.
   */
  profundo?: boolean;
  /**
   * Cuánto puede tardar el modelo. El envío automático corre en una ruta de 60s
   * (por eso 50s por defecto), pero desde el panel hay 120s: ahí conviene dar
   * más margen o se corta con "Request timed out" teniendo tiempo de sobra.
   */
  timeoutMs?: number;
}

const KEY = process.env.ANTHROPIC_API_KEY;

export function hasIA(): boolean {
  return Boolean(KEY);
}

/**
 * Trae el perfil real de Instagram y lo formatea como evidencia para el prompt.
 * Sin esto el modelo analiza a ciegas y solo puede repetir lugares comunes del
 * nicho — que es exactamente lo que hacía que 3 marcas distintas recibieran
 * prácticamente el mismo informe.
 */
async function perfilInstagram(redes?: string): Promise<string> {
  if (!redes || !hasInstagram()) return "";
  const r = await businessDiscovery(redes).catch(() => null);
  if (!r?.ok || !r.perfil) return "";
  const p = r.perfil;

  const posts = (p.media ?? []).map((m, i) => {
    const inter =
      typeof m.like_count === "number"
        ? `${m.like_count} likes, ${m.comments_count ?? 0} comentarios`
        : "sin métricas públicas";
    const texto = (m.caption ?? "(sin texto)").replace(/\s+/g, " ").slice(0, 220);
    return `  ${i + 1}. [${m.media_type ?? "?"}] ${inter}\n     "${texto}"`;
  });

  // Tasa de interacción: el dato que revela si la audiencia responde de verdad
  let engagement = "";
  const conLikes = (p.media ?? []).filter((m) => typeof m.like_count === "number");
  if (p.followers_count && conLikes.length) {
    const prom =
      conLikes.reduce((s, m) => s + (m.like_count ?? 0) + (m.comments_count ?? 0), 0) /
      conLikes.length;
    const pct = (prom / p.followers_count) * 100;
    engagement =
      `\nInteracción promedio: ${prom.toFixed(0)} por publicación = ${pct.toFixed(2)}% de sus seguidores.` +
      `\n(Referencia del sector: <1% es flojo, 1-3% normal, >3% fuerte. Úsalo para juzgar, y dilo con nombre propio.)`;
  }

  return [
    "DATOS REALES DE SU INSTAGRAM (obtenidos ahora de la API oficial de Meta —",
    "esto NO es suposición: es lo que hay en su perfil. ÚSALO como evidencia central):",
    `Usuario: @${p.username}${p.name ? ` · ${p.name}` : ""}`,
    `Seguidores: ${p.followers_count ?? "—"} · Publicaciones totales: ${p.media_count ?? "—"}`,
    p.biography ? `Biografía textual: "${p.biography}"` : "Biografía: VACÍA (dato relevante).",
    p.website ? `Enlace en bio: ${p.website}` : "Enlace en bio: NO tiene (dato relevante).",
    engagement,
    posts.length ? `\nÚltimas publicaciones:\n${posts.join("\n")}` : "\n(No devolvió publicaciones.)",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Contexto de negocio: paquetes REALES de Bushido para aterrizar la recomendación ──
const PAQUETES = `Marca y crecimiento:
- "Paquete de redes · Esencial" — $2.000.000 / mes · "Crecimiento" — $3.200.000 / mes · "Posicionamiento" — $4.300.000 / mes (mínimo 3 meses; la inversión en pauta la pone el cliente)
- "Estrategia Kansei · Auditoría express" — $900.000 · "Estrategia 90 días" — $2.400.000 · "Con acompañamiento" — desde $3.500.000
- "Pauta y amplificación · Fee gestión" — $1.200.000 / mes · "Performance" — $1.900.000 / mes · "Full-funnel" — desde $2.800.000 / mes (fee de gestión; la inversión va aparte)
- "Branding · Identidad esencial" — $1.800.000 · "Sistema de marca" — $3.400.000 · "Rebrand completo" — desde $5.500.000
Creators, UGC e influencers (el diferencial de Bushido: book propio de creadores por nicho + alianzas directas con creadores grandes):
- "UGC con data · Starter 4 piezas" — $2.200.000 · "Growth 8 piezas" — $3.900.000 · "Always-on 12 piezas/mes" — desde $5.400.000 (incluye honorarios del creador del book)
- "Influencers y talento" — SIEMPRE cotización por campaña o por proyecto, NUNCA des una cifra: la tarifa depende del perfil y del alcance del creador. Aplica a campañas con creadores, influencers de alto alcance y artistas.
Producción audiovisual:
- "Videoclip · Básico" — $3.000.000 · "Con concepto" — $5.000.000 · "Premium" — cotización
- "Mini comercial · Básico" — $1.700.000 · "Con concepto" — $2.800.000 · "Pack lanzamiento" — $4.200.000
- "Video corporativo · Corto" — $2.800.000 · "Mediano" — $4.500.000 · "Paquete empresarial" — desde $6.500.000
- "Cobertura de eventos · 3 horas" — $1.000.000 · "6 horas" — $1.600.000 · "Día completo" — $2.500.000
- "Fotografía · Media jornada" — $1.200.000 · "Día completo" — $2.000.000 · "Campaña editorial" — desde $3.200.000
- "Video de producto · 1 producto" — $550.000 · "Pack 3" — $1.400.000 · "Catálogo hasta 10" — $3.000.000
- "Reel suelto" — $400.000 · "Pack 3 reels" — $1.000.000 · "Pack 6 reels" — $1.700.000`;

const SYSTEM = `Eres el estratega de contenido de Bushido, una agencia audiovisual de Bogotá, Colombia (bushidoav.com). Tu criterio es cinematográfico, editorial y comercial: no vendes horas de cámara, vendes criterio visual que hace que la gente recuerde y compre. Hablas con seguridad, sin humo, como quien ya vio el patrón mil veces.

Analizas una marca aplicando el framework de las "7 maletas de cualquier compra" de Felipe Vergara: toda compra la mueve un motivo (racional o emocional) — el "gatillo" que dispara la decisión. Tu trabajo es descubrir esos gatillos y traducirlos en un plan de contenido y de presencia digital accionable, del que Bushido pueda encargarse.

⛔ LA PRUEBA QUE TIENES QUE PASAR — léela antes de escribir:
Si este informe le sirviera igual a OTRA marca del mismo nicho, está mal y hay que rehacerlo.
Alguien comparó tres análisis de marcas distintas y encontró los mismos diagnósticos: eso es un fracaso, no un método.

PROHIBIDO escribir (son relleno que aplica a cualquiera):
- "falta constancia", "publicar con más frecuencia", "definir una línea editorial"
- "mejorar los hooks", "no detiene el scroll", "aprovechar las tendencias"
- "contar más la historia detrás de la marca", "mostrar el behind the scenes"
- "interactuar más con la comunidad", "usar más llamados a la acción"
- "optimizar el perfil", "trabajar el storytelling", "generar más valor"
Si una frase tuya podría estar en el informe de una repostería Y en el de un artista, bórrala.

CÓMO SE VE UN DIAGNÓSTICO REAL:
- Cita EVIDENCIA concreta del perfil: números de seguidores, la biografía textual, lo que dicen sus últimas publicaciones, su tasa de interacción. Nombra lo que viste.
  · Flojo: "Le falta constancia en las publicaciones".
  · Real: "Con 2.600 seguidores promedias 40 interacciones por post (1,5%): la gente que ya te sigue sí responde, el problema es que no estás llegando a nadie nuevo".
- Señala la CONTRADICCIÓN: casi toda marca dice una cosa y hace otra. Encuéntrala. Si la bio promete "envíos a todo el país" pero ninguna publicación habla de eso, dilo.
- Di lo INCÓMODO. Si el contenido se ve amateur, si el precio no se justifica con lo que muestra, si lleva 200 publicaciones sin resultado, dilo con respeto pero sin rodeos. Un diagnóstico que solo halaga no vale nada y el cliente lo nota.
- Si algo NO se puede saber con los datos disponibles, dilo abiertamente en vez de rellenar con suposiciones bonitas.
- Las fortalezas también deben ser específicas: "producto fotogénico" no dice nada; "las fotos de producto sobre fondo blanco tienen un nivel que la mayoría de tu competencia no tiene" sí.

REGLAS DE VOZ:
- Español COLOMBIANO (tú/usted; NUNCA argentino: nada de "vos/pedí/contame").
- Cero relleno corporativo. Frases cortas. Si algo se puede decir en 8 palabras, no uses 20.
- NUNCA menciones "7 maletas", "las maletas" ni "Felipe Vergara" en tu respuesta: ese framework lo usas internamente, pero de cara al cliente el método de Bushido se llama **Kansei**. Si necesitas nombrar el método, di "Kansei" o "el método de Bushido".
- Concreto y comercial, sin relleno. Cada carencia es accionable, cada gatillo un insight real de compra, cada recomendación algo que Bushido pueda ejecutar.

⚠️ EL FOCO MANDA — lee "Qué busca el cliente" ANTES de escribir nada:
El análisis NO es siempre sobre redes sociales. Lo que el cliente eligió define el ÁNGULO de TODO el informe (resumen, fortalezas, carencias, oportunidades, gatillos, canales, métricas y propuesta). Las redes solo son el centro cuando pidió manejo de redes o no especificó. Guía:
· "Manejo de redes" o sin especificar → presencia digital, ritmo de publicación, formatos, comunidad. (El enfoque por defecto.)
· "UGC / creadores" → prueba social y voz de terceros: qué tan creíble se ve hoy la marca en boca ajena, si hay testimonios/reseñas, qué ángulos habría que testear y con qué perfil de creador. Métricas de UGC (qué ángulo convierte, costo por pieza que funciona).
· "Un videoclip" → identidad artística y narrativa: qué historia proyecta hoy el artista, coherencia visual entre sencillos, posicionamiento frente a su escena. Canales relevantes: YouTube y plataformas de música, no solo Instagram.
· "Un comercial / campaña" → propuesta de valor y mensaje: qué promete la marca, qué la diferencia, qué hook usaría la campaña y cómo se amplifica (embudo, pauta).
· "Cobertura de evento" → el evento como activo de contenido: qué se juega la marca ahí, qué piezas debe salir a producir, cómo se aprovecha antes/durante/después.
· "Fotografía" → la imagen de marca: qué tan bien se ve el producto/persona hoy, consistencia visual, si el material actual vende o solo documenta, usos (catálogo, e-commerce, prensa, redes).
En el resumen deja claro desde la primera frase que estás mirando su marca DESDE ese foco. Si el foco no es redes, no llenes el informe de recomendaciones de calendario de publicaciones: habla de lo que pidió.

QUÉ DEBES PRODUCIR:
- diagnóstico: fortalezas, carencias (accionables) y oportunidades sin explotar, TODAS leídas desde el foco de arriba.
- buyerPersona con 3 jobs-to-be-done (qué "trabajo" contrata el cliente al comprar).
- gatillos: 3 a 5 drivers de compra con su insight (por qué realmente compra la gente en este nicho, no lo que dicen).
- emociones: 3 a 5 de la taxonomía fija, y por CADA una un argumento corto de por qué mueve la compra en ESTA marca. Taxonomía: ${EMOCIONES.join(", ")}. Usa solo esos valores.
- canales (PRESENCIA DIGITAL): audita SOLO los canales relevantes PARA EL FOCO (para un videoclip pesa YouTube/Spotify; para fotografía, el catálogo o la web; para redes, IG/TikTok). Estado: activo | fuerte | irregular | débil | ausente.
  ⚠️ REGLA CRÍTICA DE CREDIBILIDAD — el cliente desconfía si le dices algo que él sabe que es falso, o si le respondes "no sé":
  · Si el cliente TE COMPARTIÓ el perfil de una red (Instagram, TikTok…) → esa red está **"activo"**. NUNCA la marques "ausente", "débil" ni digas que no sabes si existe: él sabe que la tiene. La nota debe reconocer que el canal está en marcha y nombrar el potencial del nicho; la recomendación debe ser el siguiente paso concreto para potenciarlo. Habla de OPORTUNIDAD, no de diagnóstico que no puedes ver.
  · Si el cliente NO te compartió esa red social → simplemente **NO la incluyas** en la lista de canales. No inventes ni preguntes: mejor un informe corto y certero que uno que adivina.
  · "ausente" ÚNICAMENTE para "Sitio web" o "Google / reseñas" cuando el cliente no los reporta (esos sí suelen faltar en marcas pequeñas y son venta directa) → recomiéndalos como SERVICIO de Bushido (landing/catálogo de pedidos, Google Business + estrategia de reseñas).
  · Si el cliente reporta sitio web → márcalo "activo" y recomienda cómo aprovecharlo mejor.
- metricas: 3 métricas que la marca debería vigilar SEGÚN EL FOCO (no siempre son métricas de redes: para videoclip mira retención y fuentes de tráfico en YouTube; para comercial, CPA/ROAS y tasa de conversión; para fotografía, conversión del catálogo/ficha de producto; para UGC, qué ángulo convierte). NO inventes números ni porcentajes concretos: describe QUÉ medir y por qué importa.
- propuesta: el sistema/servicio propuesto, conectando la data de la marca con la data de nicho de Bushido.
- paquete: recomienda el servicio de Bushido que MEJOR resuelve LO QUE EL CLIENTE BUSCA (mira el campo "Qué busca / contexto"). NO recomiendes el paquete de redes por defecto: si pidió un comercial → "Empresarial" o "Mini comercial / campaña"; si un videoclip → el de Videoclip; si cobertura de evento → cotización de evento; si manejo de redes o no especifica → paquete de redes. Nombre y precio EXACTOS de la lista. Además:
  · precioDesde: el precio de ENTRADA de esa familia de paquetes (ej. si recomiendas "Crecimiento", el "desde" es el del "Esencial" $2.000.000/mes). Es el ancla que ve el cliente.
  · incentivo: un bono por ARRANCAR ESTE MES que resuelva una CARENCIA concreta del diagnóstico o de la presencia digital (ej. montar Google Business + reseñas, sesión de estrategia+guiones del primer mes, reels extra, foto editorial). NUNCA un descuento en el precio: Bushido agrega valor, no rebaja. Frase corta y personalizada.
${PAQUETES}

Si no conoces la marca con certeza, infiere desde el nicho de forma honesta y prudente; es un borrador que un humano de Bushido revisa antes de enviar.`;

// Esquema de salida estructurada (structured outputs). El modelo produce solo
// el diagnóstico; marca/redes/web/fecha/estado los ponemos nosotros.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    nicho: { type: "string", description: "Nicho + sector en texto libre, ej: 'Repostería artesanal · gastronomía'" },
    categoria: { type: "string", enum: [...NICHOS], description: "La categoría de la lista que MEJOR agrupa esta marca (para la data). Si ninguna encaja, 'Otro'." },
    resumen: { type: "string", description: "2-3 frases: el diagnóstico central, sin rodeos" },
    fortalezas: { type: "array", items: { type: "string" }, description: "3 a 4 fortalezas reales" },
    carencias: { type: "array", items: { type: "string" }, description: "3 a 4 carencias accionables" },
    oportunidades: { type: "array", items: { type: "string" }, description: "3 oportunidades sin explotar" },
    buyerPersona: {
      type: "object",
      additionalProperties: false,
      properties: {
        nombre: { type: "string", description: "Nombre corto y evocador del arquetipo, ej: 'La que se da el gusto bonito'" },
        descripcion: { type: "string" },
        jtbd: { type: "array", items: { type: "string" }, description: "3 jobs-to-be-done" },
      },
      required: ["nombre", "descripcion", "jtbd"],
    },
    gatillos: {
      type: "array",
      description: "3 a 5 gatillos (drivers de compra)",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombre: { type: "string" },
          insight: { type: "string" },
        },
        required: ["nombre", "insight"],
      },
    },
    emociones: {
      type: "array",
      description: "3 a 5 emociones de la taxonomía fija, cada una con su argumento",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          emocion: { type: "string", enum: [...EMOCIONES] },
          porque: { type: "string", description: "Por qué esa emoción mueve la compra en esta marca (1-2 frases)" },
        },
        required: ["emocion", "porque"],
      },
    },
    canales: {
      type: "array",
      description: "Auditoría de presencia: Instagram, TikTok, YouTube, Sitio web, Google / reseñas",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          canal: { type: "string" },
          estado: { type: "string", enum: ["activo", "fuerte", "irregular", "débil", "ausente"] },
          nota: { type: "string", description: "Diagnóstico corto del canal" },
          recomendacion: { type: "string", description: "Qué hacer (servicio Bushido cuando aplica)" },
        },
        required: ["canal", "estado", "nota", "recomendacion"],
      },
    },
    metricas: {
      type: "array",
      description: "3 métricas de redes a vigilar (sin inventar números)",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombre: { type: "string" },
          queMirar: { type: "string" },
          porQue: { type: "string" },
        },
        required: ["nombre", "queMirar", "porQue"],
      },
    },
    propuesta: { type: "string", description: "El sistema de contenido/presencia propuesto, 2-3 frases" },
    paquete: {
      type: "object",
      additionalProperties: false,
      properties: {
        nombre: { type: "string", description: "Nombre EXACTO de un paquete de Bushido" },
        precio: { type: "string", description: "Precio EXACTO del tier recomendado, ej: '$3.200.000 / mes'" },
        precioDesde: { type: "string", description: "Precio de entrada de esa familia (ancla 'desde'), ej: '$2.000.000 / mes'" },
        porque: { type: "string", description: "Por qué ese paquete para esta etapa" },
        incentivo: { type: "string", description: "Bono por arrancar este mes que tapa una carencia (NO descuento)" },
      },
      required: ["nombre", "precio", "precioDesde", "porque", "incentivo"],
    },
  },
  required: [
    "nicho", "categoria", "resumen", "fortalezas", "carencias", "oportunidades",
    "buyerPersona", "gatillos", "emociones", "canales", "metricas",
    "propuesta", "paquete",
  ],
} as const;

interface ModelOut {
  nicho: string;
  categoria: Nicho;
  resumen: string;
  fortalezas: string[];
  carencias: string[];
  oportunidades: string[];
  buyerPersona: Analisis["buyerPersona"];
  gatillos: Analisis["gatillos"];
  emociones: EmocionDetalle[];
  canales: Analisis["canales"];
  metricas: Analisis["metricas"];
  propuesta: string;
  paquete: Analisis["paquete"];
}

// Tope de tiempo para la investigación web. Vercel corta la función (60s en
// Hobby) y el análisis corre dentro de ese presupuesto: si la búsqueda se
// demora, la abandonamos y seguimos — mejor un informe sin research que ninguno.
// Medido en producción: la búsqueda web tarda ~35s. Solo se usa en modo profundo.
const RESEARCH_TIMEOUT_MS = Number(process.env.RESEARCH_TIMEOUT_MS || 25000);

/** PASO 1 (solo modo profundo) — investiga la marca en la web para basarse en HECHOS. */
async function investigar(client: Anthropic, input: AnalizarInput): Promise<string> {
  try {
    const q = [
      `Investiga en internet esta marca para un análisis de marketing. Marca: "${input.marca}".`,
      input.redes ? `Instagram: ${input.redes}.` : "",
      input.tiktok ? `TikTok: ${input.tiktok}.` : "",
      input.web ? `Sitio web: ${input.web}.` : "",
      `Busca su presencia REAL: sus perfiles de redes y qué tipo de contenido publican, si tienen sitio web, ficha/reseñas en Google, ciudad, y a qué se dedican exactamente. Devuelve un BRIEF de hechos verificados en viñetas cortas. Si algo no lo encuentras, dilo explícitamente ("no encontré..."). NO inventes datos.`,
    ]
      .filter(Boolean)
      .join(" ");
    const t0 = Date.now();
    const res = await client.messages.create(
      {
        model: "claude-opus-4-8",
        max_tokens: 2000,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
        messages: [{ role: "user", content: q }],
      },
      { timeout: RESEARCH_TIMEOUT_MS, maxRetries: 0 } // no reintentar: gastaría el presupuesto
    );
    const brief = res.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    console.log(`[investigar] ok en ${Date.now() - t0}ms (${brief.length} chars)`);
    return brief;
  } catch (e) {
    console.error("[investigar] sin research (timeout o error), sigo igual:", e instanceof Error ? e.message : e);
    return "";
  }
}

/** Genera el análisis con Claude: investiga la web y luego estructura. null si no hay API key. */
export async function generarAnalisis(input: AnalizarInput): Promise<Analisis | null> {
  if (!KEY) {
    console.warn("[analizar] SIN ANTHROPIC_API_KEY — configúrala en Vercel para el análisis automático.");
    return null;
  }
  const client = new Anthropic({ apiKey: KEY });

  // PASO 1: investigación web — SOLO en modo profundo (tarda ~35s). El análisis
  // gratis va sin ella para que llegue rápido y sin riesgo de timeout.
  const brief = input.profundo ? await investigar(client, input) : "";

  // PASO 1b: el perfil REAL de Instagram (rápido, ~300ms). Esto es lo que
  // separa un análisis específico de uno genérico: sin datos, el modelo solo
  // puede decir obviedades del nicho.
  const perfil = await perfilInstagram(input.redes);

  // PASO 2: estructurar el análisis usando esos hechos
  const userMsg = [
    `Marca: ${input.marca}`,
    `Instagram / redes: ${input.redes || "(no lo compartió)"}`,
    `TikTok: ${input.tiktok || "(no lo compartió — NO lo incluyas en canales)"}`,
    `Sitio web: ${input.web || "(no reporta sitio web)"}`,
    ``,
    `>>> FOCO DEL ANÁLISIS (lo que el cliente eligió): ${input.contexto || "(no especificó → enfoque general de redes)"}`,
    `Todo el informe debe leerse desde ese foco, no solo desde redes sociales.`,
    "",
    perfil,
    "",
    brief
      ? `INVESTIGACIÓN WEB (hechos reales — BÁSATE en esto, no inventes más allá de lo aquí verificado):\n${brief}`
      : "",
    "",
    "Analiza esta marca y devuelve el informe estructurado. Recuerda la regla de honestidad de canales y recomienda el servicio que resuelve lo que el cliente busca.",
  ]
    .filter((l) => l !== "")
    .join("\n");

  // Config que YA funcionaba en producción (no la aprietes: si el modelo se corta,
  // el informe nunca llega). El timeout va holgado dentro de los 60s de la ruta.
  const t1 = Date.now();
  const res = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema: SCHEMA }, effort: "medium" },
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    },
    { timeout: input.timeoutMs ?? 50000, maxRetries: 1 }
  );
  console.log(`[analizar] informe estructurado en ${Date.now() - t1}ms (profundo=${!!input.profundo})`);

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("El modelo no devolvió contenido de texto.");
  }
  const data = JSON.parse(textBlock.text) as ModelOut;

  // taxonomía plana (para consultar/comparar) derivada del detalle
  const emociones = (data.emociones ?? []).map((e) => e.emocion) as Emocion[];

  return {
    marca: input.marca,
    redes: input.redes,
    web: input.web,
    fecha: String(new Date().getFullYear()),
    nicho: data.nicho,
    categoria: data.categoria,
    resumen: data.resumen,
    fortalezas: data.fortalezas,
    carencias: data.carencias,
    oportunidades: data.oportunidades,
    buyerPersona: data.buyerPersona,
    gatillos: data.gatillos,
    emociones,
    emocionesDetalle: data.emociones,
    canales: data.canales,
    metricas: data.metricas,
    propuesta: data.propuesta,
    paquete: data.paquete,
    estado: "analizado",
  };
}
