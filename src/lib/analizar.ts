// Motor de análisis de Bushido — corre el framework de las 7 maletas con la
// API de Claude y devuelve un `Analisis` estructurado listo para la plantilla.
//
// Requiere ANTHROPIC_API_KEY (ponla en Vercel → Environment Variables). Si no
// está configurada, generarAnalisis() devuelve null (no rompe: el resto del
// pipeline sigue funcionando, solo no se genera el informe automático).

import Anthropic from "@anthropic-ai/sdk";
import {
  businessDiscovery,
  hasInstagram,
  limpiarUsuario,
  pareceWebNoInstagram,
  type IgMedia,
  type IgResultado,
} from "./instagram";
import { leerWeb } from "./web";
import { verificarTiktok, type VerificacionTiktok } from "./tiktok";
import { briefingDelSector, briefingParaPrompt } from "./os-briefing";
import {
  EMOCIONES,
  ETAPAS,
  NICHOS,
  PERFILES,
  type Analisis,
  type EmocionDetalle,
  type Emocion,
  type EtapaMarca,
  type FuentesInforme,
  type Nicho,
  type PerfilLead,
} from "./analisis";

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
  /** Cuánto esperar al modelo por intento (por defecto MODEL_TIMEOUT_MS). */
  timeoutMs?: number;
  /**
   * Informe corto para quien todavía no es cliente: se lo lleva algo real
   * (dos fortalezas, una carencia completa, el dato de su sector) y ve
   * nombrado lo que no incluye. El contenido se genera igual — lo que cambia
   * es qué se muestra.
   */
  abrebocas?: boolean;
}

const KEY = process.env.ANTHROPIC_API_KEY;

export function hasIA(): boolean {
  return Boolean(KEY);
}

/** Corta por caracteres completos: un .slice() normal puede partir un emoji en
 *  dos y el surrogate suelto hace que la API rechace el JSON ("no low surrogate
 *  in string") — así se perdió el informe de Girly Pop Culture. */
function recortar(s: string, n: number): string {
  const cps = Array.from(s);
  return cps.length > n ? cps.slice(0, n).join("") + "…" : s;
}

/** Red de seguridad: reemplaza cualquier surrogate suelto que se haya colado. */
function bienFormado(s: string): string {
  const t = s as string & { toWellFormed?: () => string };
  return typeof t.toWellFormed === "function" ? t.toWellFormed() : s;
}

function haceDias(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.round((Date.now() - t) / 86_400_000)) : null;
}

interface LecturaIG {
  texto: string;
  pistas: string;
  estado: FuentesInforme["instagram"];
  detalle?: string;
  website?: string; // el enlace de su bio: si no nos dio web, se lee ese
}

/**
 * Trae el perfil real de Instagram y lo formatea como evidencia para el prompt.
 * Sin esto el modelo analiza a ciegas y solo puede repetir lugares comunes del
 * nicho — que es exactamente lo que hacía que 3 marcas distintas recibieran
 * prácticamente el mismo informe. Si no se puede, devuelve el MOTIVO real.
 */
async function perfilInstagram(redes?: string): Promise<LecturaIG> {
  if (!redes?.trim()) return { texto: "", pistas: "", estado: "no_compartido" };
  if (!hasInstagram()) return { texto: "", pistas: "", estado: "config", detalle: "Falta el token de Instagram." };
  const r = await businessDiscovery(redes).catch(
    (e): IgResultado => ({ ok: false, motivo: "red", error: e instanceof Error ? e.message : String(e) })
  );
  if (!r.ok || !r.perfil) {
    console.warn(`[analizar] Instagram no leído (${r.motivo}): ${r.error}`);
    return { texto: "", pistas: "", estado: r.motivo ?? "red", detalle: r.error };
  }
  const p = r.perfil;

  const media = p.media ?? [];
  const interaccion = (m: IgMedia) =>
    typeof m.like_count === "number" ? m.like_count + (m.comments_count ?? 0) : null;
  const valores = media.map(interaccion).filter((v): v is number => v !== null);

  // MEDIANA, no promedio: un solo post viral (o pautado) infla el promedio y
  // hacía que el informe le dijera "interacción fuerte, por encima del sector"
  // a una cuenta cuya publicación típica está en rango flojo (caso @bushido.aa:
  // 4,38 % de promedio contra 0,93 % de mediana).
  const ordenados = [...valores].sort((a, b) => a - b);
  const mediana = ordenados.length
    ? ordenados.length % 2
      ? ordenados[(ordenados.length - 1) / 2]
      : (ordenados[ordenados.length / 2 - 1] + ordenados[ordenados.length / 2]) / 2
    : 0;
  // Los multiplicadores se calculan aquí: el modelo los copia, no los calcula
  // (escribió "14 veces tu promedio" donde eran 5).
  const veces = (v: number) => (mediana > 0 ? v / mediana : 0);
  const fmt = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 });

  const posts = media.map((m, i) => {
    const v = interaccion(m);
    const dias = haceDias(m.timestamp);
    const cuando = dias === null ? "fecha desconocida" : dias === 0 ? "hoy" : `hace ${dias} días`;
    const esVideo = m.media_product_type === "REELS" || m.media_type === "VIDEO";
    const tipo = m.media_product_type === "REELS" ? "REEL" : (m.media_type ?? "?");
    const inter =
      v === null
        ? "likes ocultos"
        : `${m.like_count} likes, ${m.comments_count ?? 0} comentarios` +
          (mediana > 0 ? ` = ${fmt(veces(v))}x la mediana` : "") +
          (veces(v) >= 3 ? " ⚠️ ATÍPICO (puede ser viral o pautado: no lo tomes como su rendimiento normal)" : "") +
          (esVideo ? " · video: sin reproducciones" : "");
    const texto = recortar((m.caption ?? "(sin texto)").replace(/\s+/g, " "), 220);
    return `  ${i + 1}. [${tipo} · ${cuando}] ${inter}\n     "${texto}"`;
  });

  // Ritmo real: cuánto hace de la última y cuántos días cubren las leídas.
  const fechas = media.map((m) => haceDias(m.timestamp)).filter((d): d is number => d !== null);
  const ritmo = fechas.length
    ? `\nÚltima publicación: hace ${Math.min(...fechas)} días. Las últimas ${fechas.length} publicaciones cubren ${Math.max(...fechas) - Math.min(...fechas)} días.`
    : "\n(Sin fechas de publicación: NO opines sobre frecuencia ni constancia.)";

  // Tasa de interacción: el dato que revela si la audiencia responde de verdad
  let engagement = "";
  if (p.followers_count && valores.length) {
    const promedio = valores.reduce((s, v) => s + v, 0) / valores.length;
    const pctMediana = (mediana / p.followers_count) * 100;
    const pctPromedio = (promedio / p.followers_count) * 100;
    const atipicos = valores.filter((v) => veces(v) >= 3).length;
    engagement =
      `\nInteracción MEDIANA: ${fmt(mediana)} por publicación = ${pctMediana.toFixed(2)}% de sus seguidores. ← USA ESTA para juzgar.` +
      `\n(Promedio: ${fmt(promedio)} = ${pctPromedio.toFixed(2)}%${atipicos ? `, inflado por ${atipicos} publicación(es) atípica(s)` : ""}.)` +
      `\n(Referencia del sector sobre la MEDIANA: <1% es flojo, 1-3% normal, >3% fuerte. Úsalo para juzgar, y dilo con nombre propio.)`;
  }

  const avisoMuestra =
    `\n⚠️ Solo viste estas ${media.length} publicaciones de ${p.media_count ?? "?"} en total.` +
    ` Toda afirmación sobre su feed va acotada a ellas ("en tus últimas ${media.length} publicaciones…"):` +
    ` NUNCA "nunca", "en ningún lado" ni "no hay una sola". Todos los números y "x veces" ya vienen calculados arriba: cópialos, no hagas cuentas.` +
    `\n⚠️ De los videos/reels NO tenemos reproducciones (Meta no las da de cuentas ajenas): NO compares reels contra fotos o carruseles por likes ni concluyas que "los reels no te rinden".`;

  const texto = [
    "DATOS REALES DE SU INSTAGRAM (obtenidos ahora de la API oficial de Meta —",
    "esto NO es suposición: es lo que hay en su perfil. ÚSALO como evidencia central):",
    `Usuario: @${p.username}${p.name ? ` · ${p.name}` : ""}`,
    `Seguidores: ${p.followers_count ?? "—"} · Publicaciones totales: ${p.media_count ?? "—"}`,
    p.biography ? `Biografía textual: "${p.biography}"` : "Biografía: VACÍA (dato relevante).",
    p.website ? `Enlace en bio: ${p.website}` : "Enlace en bio: NO tiene (dato relevante).",
    engagement,
    ritmo,
    posts.length ? `\nÚltimas ${posts.length} publicaciones:\n${posts.join("\n")}` : "\n(No devolvió publicaciones.)",
    posts.length ? avisoMuestra : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Lo que dice de sí misma es la mejor pista para saber a qué sector pertenece:
  // el nombre de la marca casi nunca lo revela ("Bianco Bake Lab" no dice repostería).
  const pistas = recortar(
    [p.name, p.biography, ...media.map((m) => m.caption ?? "")].filter(Boolean).join(" "),
    1200
  );

  return { texto, pistas, estado: "leido", website: p.website };
}

/** Lo que el modelo tiene que saber cuando NO pudo ver la cuenta, según el motivo real. */
function avisoSinInstagram(ig: LecturaIG, redes?: string): string {
  const comun = [
    "REGLAS OBLIGATORIAS:",
    "· NO cites su biografía, ni sus publicaciones, ni lo que dicen sus textos: no los has visto.",
    "· NO inventes seguidores, likes, interacción, número de publicaciones ni porcentajes. Ninguna cifra.",
    "· NO afirmes qué publica, cada cuánto, cómo se ve su feed ni qué le falta. No lo sabes.",
    "· SÍ puedes trabajar con lo que el cliente escribió, con su web (si abajo aparece leída), con su nicho y con la data del sector.",
    "· Y DILO en el resumen, en una frase: este diagnóstico se hizo sin acceso a su cuenta de Instagram.",
  ];
  if (ig.estado === "no_compartido") {
    return ["⚠️ El cliente NO compartió Instagram.", ...comun].join("\n");
  }
  if (ig.estado === "usuario_invalido") {
    return [
      `⚠️ En el campo Instagram escribió "${redes}", que no es un usuario de Instagram. NO incluyas Instagram en canales ni hables de su cuenta.`,
      ...comun,
    ].join("\n");
  }
  if (ig.estado === "no_existe_o_personal") {
    return [
      `⚠️ Consultamos @${limpiarUsuario(redes ?? "")} en la API oficial de Meta y no apareció como cuenta profesional.`,
      "Puede ser que el usuario esté mal escrito o que la cuenta no esté configurada como profesional: NO SABEMOS cuál de las dos.",
      "· NUNCA afirmes que \"no es cuenta profesional\" como un hecho. Si lo mencionas, dilo como posibilidad (\"si tu cuenta no es profesional…\").",
      ...comun,
    ].join("\n");
  }
  // config / red: el problema es nuestro, no del cliente.
  return [
    "⚠️ No pudimos consultar su Instagram por una falla técnica de nuestro lado (no es culpa de su cuenta).",
    "· NO digas nada sobre el tipo de cuenta ni sobre por qué no se pudo leer.",
    ...comun,
  ].join("\n");
}

// ── Contexto de negocio: paquetes REALES de Bushido para aterrizar la recomendación ──
const PAQUETES = `Growth Systems (sistemas de crecimiento, NO paquetes de contenido — el cliente compra inteligencia continua, no una cantidad de reels):
- "Sistema de crecimiento · Insight" — $2.500.000 / mes: 12 publicaciones al mes (lunes, miércoles y viernes) = 4 reels, 4 carruseles y 4 fotos de 1 jornada de rodaje; una hipótesis y reporte mensual; 1 ronda de revisión; NO incluye pauta.
- "Sistema de crecimiento · Evolution" — $3.900.000 / mes: 16 publicaciones al mes (lunes a jueves) = 6 reels, 5 carruseles y 5 fotos de 2 jornadas; stories 2 veces por semana; gestión de pauta en Meta y testeo A/B; reporte quincenal; 2 rondas de revisión.
- "Sistema de crecimiento · Dominance" — $5.900.000 / mes: 20 publicaciones al mes (lunes a viernes) = 8 reels, 1 storytelling, 6 carruseles y 5 fotos de 2 jornadas; stories 3 veces por semana; pauta en Meta y TikTok; 1 pieza con creador del book; Project Manager dedicado; reporte semanal; 3 rondas de revisión.
- Los tres: mínimo 3 meses; la inversión en pauta la pone el cliente. NUNCA prometas más publicaciones ni formatos de los que trae cada plan: la diferencia entre planes es lo que el cliente paga.
- "Estrategia Kansei · Auditoría express" — $900.000 · "Estrategia 90 días" — $2.400.000 · "Con acompañamiento" — desde $3.500.000
- "Pauta y amplificación · Fee gestión" — $1.200.000 / mes · "Performance" — $1.900.000 / mes · "Full-funnel" — desde $2.800.000 / mes (fee de gestión; la inversión va aparte)
- "Branding · Identidad esencial" — $1.800.000 · "Sistema de marca" — $3.400.000 · "Rebrand completo" — desde $5.500.000
Creators, UGC e influencers (el diferencial de Bushido: book propio de creadores por nicho + alianzas directas con creadores grandes):
- "Creator Matching · Starter 4 piezas" — $2.200.000 · "Growth 8 piezas" — $3.900.000 · "Always-on 12 piezas/mes" — desde $5.400.000 (incluye honorarios del creador del book)
- "Influencers y talento" — SIEMPRE cotización por campaña o por proyecto, NUNCA des una cifra: la tarifa depende del perfil y del alcance del creador. Aplica a campañas con creadores, influencers de alto alcance y artistas.
Producción audiovisual:
- "Videoclip · Básico" — $3.900.000 · "Con concepto" — $6.500.000 · "Premium" — cotización por proyecto
- "Mini comercial · Básico" — $2.600.000 · "Con concepto" — $3.900.000 · "Pack lanzamiento" — $5.900.000
- "Video corporativo · Corto" — $3.600.000 · "Mediano" — $5.600.000 · "Paquete empresarial" — desde $8.000.000
- "Cobertura de eventos · 3 horas" — $1.400.000 · "6 horas" — $2.200.000 · "Día completo" — $3.400.000
- "Bushido Content Day · Media jornada" — $1.800.000 · "Content Day completo" — $3.200.000 · "Campaña editorial" — desde $4.800.000
- "Video de producto · 1 producto" — $800.000 · "Pack 3" — $2.100.000 · "Catálogo hasta 10" — $4.800.000
- "Piezas sueltas · 1 pieza" — $800.000 · "3 piezas" — $2.100.000 · "6 piezas" — $3.900.000 (incluye guion, camarógrafo, asistente y editor)`;

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
  · Real: "Con 2.600 seguidores, tu publicación típica tiene 40 interacciones (1,5 %): la gente que ya te sigue sí responde, el problema es que no estás llegando a nadie nuevo".
- Señala la CONTRADICCIÓN: casi toda marca dice una cosa y hace otra. Encuéntrala. Si la bio promete "envíos a todo el país" pero ninguna de las publicaciones que viste habla de eso, dilo ("en tus últimas 12 publicaciones no aparece").
- Di lo INCÓMODO. Si el contenido se ve amateur, si el precio no se justifica con lo que muestra, si lleva 200 publicaciones sin resultado, dilo con respeto pero sin rodeos. Un diagnóstico que solo halaga no vale nada y el cliente lo nota.
- Si algo NO se puede saber con los datos disponibles, dilo abiertamente en vez de rellenar con suposiciones bonitas.
- NO nombres ciudad, barrio ni país salvo que aparezca en su bio, en su web, en sus textos o en lo que escribió el cliente. Si no lo sabes, habla de "tu ciudad" o "tu zona".
- Las fortalezas también deben ser específicas: "producto fotogénico" no dice nada; "las fotos de producto sobre fondo blanco tienen un nivel que la mayoría de tu competencia no tiene" sí.

REGLAS DE VOZ:
- Español COLOMBIANO (tú/usted; NUNCA argentino: nada de "vos/pedí/contame").
- Cero relleno corporativo. Frases cortas. Si algo se puede decir en 8 palabras, no uses 20.
- NUNCA menciones "7 maletas", "las maletas" ni "Felipe Vergara" en tu respuesta: ese framework lo usas internamente, pero de cara al cliente el método de Bushido se llama **Kansei**. Si necesitas nombrar el método, di "Kansei" o "el método de Bushido".
- Concreto y comercial, sin relleno. Cada carencia es accionable, cada gatillo un insight real de compra, cada recomendación algo que Bushido pueda ejecutar.

⚠️ EL FOCO MANDA — lee "Qué busca el cliente" ANTES de escribir nada:
El análisis NO es siempre sobre redes sociales. Lo que el cliente eligió define el ÁNGULO de TODO el informe (resumen, fortalezas, carencias, oportunidades, gatillos, canales, métricas y propuesta). Las redes solo son el centro cuando pidió manejo de redes o no especificó. Guía:
· "Manejo de redes" o sin especificar → presencia digital, ritmo de publicación, formatos, comunidad. (El enfoque por defecto.)
· "UGC / creadores" o "Creadores / UGC para mi marca" → prueba social y voz de terceros: qué tan creíble se ve hoy la marca en boca ajena, si hay testimonios/reseñas, qué ángulos habría que testear y con qué perfil de creador. Métricas de UGC (qué ángulo convierte, costo por pieza que funciona).
· "Un videoclip" → identidad artística y narrativa: qué historia proyecta hoy el artista, coherencia visual entre sencillos, posicionamiento frente a su escena. Canales relevantes: YouTube y plataformas de música, no solo Instagram.
· "Un comercial / campaña" → propuesta de valor y mensaje: qué promete la marca, qué la diferencia, qué hook usaría la campaña y cómo se amplifica (embudo, pauta).
· "Cobertura de evento" → el evento como activo de contenido: qué se juega la marca ahí, qué piezas debe salir a producir, cómo se aprovecha antes/durante/después.
· "Fotografía" → la imagen de marca: qué tan bien se ve el producto/persona hoy, consistencia visual, si el material actual vende o solo documenta, usos (catálogo, e-commerce, prensa, redes).
· "Soy creador o freelance" → NO es un cliente de producción: es talento. Lee su marca personal: cómo consigue clientes, qué portafolio muestra, qué lo diferencia.
En el resumen deja claro desde la primera frase que estás mirando su marca DESDE ese foco. Si el foco no es redes, no llenes el informe de recomendaciones de calendario de publicaciones: habla de lo que pidió.

📊 SI RECIBES DATA DEL SECTOR ("LO QUE YA SABEMOS DE ESTA CATEGORÍA"):
Es lo único del informe que un competidor no puede improvisar: demuestra que detrás hay un sistema, no un texto bonito. Úsala así:
1. En el diagnóstico, teje UNO O DOS datos CON LA EVIDENCIA Y EL NÚMERO delante. La forma es siempre la misma: cuántas marcas del sector hemos analizado, cuál es el patrón, y dónde queda ESTA marca frente a él.
   · Bien: "De las 8 marcas de repostería que hemos analizado, la carencia más repetida es que muestran el producto pero nunca el proceso. Tu cuenta la comparte: en tus últimas 12 publicaciones no aparece el taller."
   · Bien (contraste): "…y tú eres de las pocas que no: tus últimos 4 posts sí muestran el proceso. Esa es tu ventaja y no la estás capitalizando."
   · Mal: "El sector suele tener problemas de contenido." (sin número, sin evidencia, sin comparación → bórralo)
2. El CIERRE-GANCHO es UNA transferencia: una palanca que funciona en OTRO sector y que casi nadie usa en el suyo. Nombra la OPORTUNIDAD, nunca la ejecución. Se cierra diciendo que cómo aplicarla a su marca es parte de lo que trabajamos con clientes. No des el paso a paso: si después de leerlo el cliente puede ejecutarlo solo, lo escribiste mal.
3. ⚠️ SI LA MUESTRA ES CORTA (te lo avisa el bloque): NO escribas "el sector hace X" ni "las marcas de tu sector". Escribe "entre lo que hemos analizado…" o "en las marcas de tu sector que hemos mirado hasta ahora…". Nunca presentes un patrón de pocas marcas como una verdad del mercado: si el cliente lo comprueba y no le cuadra, perdimos la venta y la credibilidad.
4. Si NO recibes data del sector, no menciones al sector ni inventes cifras: escribe el diagnóstico solo con la evidencia de su cuenta.

QUÉ DEBES PRODUCIR:
- diagnóstico: fortalezas, carencias (accionables) y oportunidades sin explotar, TODAS leídas desde el foco de arriba.
- buyerPersona con 3 jobs-to-be-done (qué "trabajo" contrata el cliente al comprar).
- gatillos: 3 a 5 drivers de compra con su insight (por qué realmente compra la gente en este nicho, no lo que dicen).
- emociones: 3 a 5 de la taxonomía fija, y por CADA una un argumento corto de por qué mueve la compra en ESTA marca. Taxonomía: ${EMOCIONES.join(", ")}. Usa solo esos valores.
- canales (PRESENCIA DIGITAL): audita SOLO los canales relevantes PARA EL FOCO (para un videoclip pesa YouTube/Spotify; para fotografía, el catálogo o la web; para redes, IG/TikTok). Estado: activo | fuerte | irregular | débil | ausente.
  ⚠️ REGLA CRÍTICA DE CREDIBILIDAD — el cliente desconfía si le dices algo que él sabe que es falso, o si le respondes "no sé":
  · Instagram: si abajo vienen DATOS REALES, juzga con ellos ("activo", "fuerte", "irregular" o "débil", con el número delante). Si lo compartió pero NO lo pudimos leer → "activo", sin opinar de su contenido: habla del potencial y del siguiente paso. Si lo que escribió no es un usuario de Instagram, no lo incluyas.
  · TikTok: solo sabemos si la cuenta EXISTE (abajo lo dice); NUNCA vemos sus videos ni sus números. Si está verificada o no se pudo verificar → "activo", sin opinar de su contenido: habla de la oportunidad del formato en su nicho. Si NO apareció en TikTok → "por confirmar" y en la nota pídele revisar el usuario, sin afirmar que no existe. Si no lo compartió → NO lo incluyas.
  · Cualquier otra red que no compartió → NO la incluyas. Mejor un informe corto y certero que uno que adivina.
  · Sitio web: si abajo viene "LECTURA DE SU SITIO WEB", opina SOLO de lo que ahí aparece (título, textos, si hay o no botones de reservar/comprar/contacto). Si reportó web pero no se pudo leer → "activo", sin opinar de su contenido ni de su diseño. Si no reportó web → "ausente" con la nota "No nos compartiste sitio web" (no afirmes que no existe) y recomiéndala como servicio.
  · "Google / reseñas": NUNCA lo verificamos. Si lo incluyes, estado "por confirmar", di en la nota que no lo revisamos y preséntalo como oportunidad, NUNCA como carencia comprobada ("no tienes reseñas" está prohibido).
- metricas: 3 métricas que la marca debería vigilar SEGÚN EL FOCO (no siempre son métricas de redes: para videoclip mira retención y fuentes de tráfico en YouTube; para comercial, CPA/ROAS y tasa de conversión; para fotografía, conversión del catálogo/ficha de producto; para UGC, qué ángulo convierte). NO inventes números ni porcentajes concretos: describe QUÉ medir y por qué importa.
- propuesta: el sistema/servicio propuesto, conectando la data de la marca con la data de nicho de Bushido.
- perfil: QUÉ ES quien pide el análisis (lista cerrada). Míralo ANTES de recomendar nada:
  · "Creativo o freelance audiovisual" (fotógrafo, filmmaker, realizador, editor, gaffer, storyboard… y también AGENCIAS o PRODUCTORAS audiovisuales, aunque sean empresas: son competencia, no clientes) y "Creador de contenido / UGC" (el que VENDE su contenido a marcas, con media kit o "colaboraciones") NO son clientes de producción: son colegas o talento. A ellos NUNCA les vendas un comercial, un videoclip, una cobertura ni piezas UGC: sería venderles lo que ellos mismos hacen. Su diagnóstico va sobre su MARCA PERSONAL (cómo consigue clientes, qué portafolio muestra) y la recomendación es "Estrategia Kansei · Auditoría express". En la propuesta invítalos al Gremio de Bushido (bushidoav.com/gremio), el banco de talento con el que Bushido trabaja en sus producciones.
  · Si eligió "UGC / creadores" pero ES creador (no una marca que busca creadores), aplica la regla anterior: está buscando trabajo, no proveedores.
- etapa: "Arrancando" | "En crecimiento" | "Establecida" según seguidores, publicaciones y lo que muestra su web. Si no tienes datos reales de su cuenta ni de su web, "Sin datos para saberlo" — no adivines.
- paquete: recomienda el servicio de Bushido que MEJOR resuelve LO QUE EL CLIENTE BUSCA (mira el FOCO). Nombre y precio EXACTOS de la lista:
  · "Manejo de redes" o no especificó → Growth Systems. El nivel depende de la ETAPA: "Arrancando" o "Sin datos para saberlo" → siempre "Insight"; "En crecimiento" → "Insight" o "Evolution"; "Dominance" solo para una marca "Establecida" que ya invierte en pauta. Con los mismos datos, la misma recomendación: no subas de nivel sin evidencia.
  · "UGC / creadores" o "Creadores / UGC para mi marca" (una marca que busca creadores) → "Creator Matching" (Starter o Growth).
  · "Soy creador o freelance" → "Estrategia Kansei · Auditoría express" + invitación al Gremio (ver perfil).
  · "Un videoclip" → "Videoclip" (Básico o Con concepto).
  · "Un comercial / campaña" → "Mini comercial" (Básico, Con concepto o Pack lanzamiento); si es una empresa que vende a otras empresas, "Video corporativo".
  · "Cobertura de evento" → "Cobertura de eventos". NO inventes el evento: si no sabes cuál es, no lo describas.
  · "Fotografía" → "Bushido Content Day" (imagen de marca o persona) o "Video de producto" (catálogo de producto).
  · "Aún no sé" → "Estrategia Kansei · Auditoría express".
  · precioDesde: el precio de ENTRADA de esa familia de paquetes (ej. si recomiendas "Evolution", el "desde" es el de "Insight" $2.500.000 / mes). Es el ancla que ve el cliente.
  · incentivo: un bono por ARRANCAR ESTE MES que resuelva una CARENCIA concreta del diagnóstico o de la presencia digital (ej. sesión de estrategia y guiones del primer mes, foto editorial de marca, montar Google Business). NUNCA un descuento en el precio y NUNCA publicaciones o reels extra por encima del plan: Bushido agrega valor, no rebaja ni infla el volumen. Frase corta y personalizada.
${PAQUETES}

⚠️ Este informe le llega DIRECTO al cliente, sin que nadie lo revise antes. Cada afirmación sobre SU marca tiene que salir de los datos de abajo (lo que escribió, su Instagram, su web o la data del sector). Lo que infieras desde el nicho, dilo como lectura del nicho ("en tu categoría suele pasar…"), nunca como algo que viste en su cuenta.`;

// Bloques que SOLO existen cuando el cerebro conoce el sector. Se añaden al
// esquema en tiempo de ejecución: si no hay data, el campo no existe y el
// modelo no puede inventarse una afirmación sobre "las marcas de tu sector".
const CAMPOS_SECTOR = {
  datoSector: {
    type: "object",
    additionalProperties: false,
    properties: {
      hallazgo: {
        type: "string",
        description:
          "Una frase con la evidencia y el número: 'De las N marcas de <sector> que hemos analizado, la carencia más repetida es X'.",
      },
      veredicto: {
        type: "string",
        description:
          "Dónde queda ESTA marca frente a ese patrón: si lo comparte o si es de las pocas que no. Con evidencia de su perfil.",
      },
    },
    required: ["hallazgo", "veredicto"],
  },
  cierreGancho: {
    type: "string",
    description:
      "UNA transferencia como cierre: qué palanca funciona en OTRO sector y casi nadie usa en el suyo, y qué abriría para su marca. Nombra la oportunidad, NO la ejecución. Cierra con que aplicarla es parte de lo que se trabaja con clientes.",
  },
} as const;

// Esquema de salida estructurada (structured outputs). El modelo produce solo
// el diagnóstico; marca/redes/web/fecha/estado los ponemos nosotros.
const SCHEMA_BASE = {
  type: "object",
  additionalProperties: false,
  properties: {
    nicho: { type: "string", description: "Nicho + sector en texto libre, ej: 'Repostería artesanal · gastronomía'" },
    categoria: { type: "string", enum: [...NICHOS], description: "La categoría de la lista que MEJOR agrupa esta marca (para la data). Si ninguna encaja, 'Otro'." },
    perfil: { type: "string", enum: [...PERFILES], description: "Qué es quien pide el análisis. Un fotógrafo, filmmaker, agencia o productora audiovisual es 'Creativo o freelance audiovisual' (aunque sea una empresa); quien vende contenido a marcas es 'Creador de contenido / UGC'." },
    etapa: { type: "string", enum: [...ETAPAS], description: "Etapa de la marca según datos reales. Sin datos de su cuenta ni de su web: 'Sin datos para saberlo'." },
    resumen: { type: "string", description: "2-3 frases: el diagnóstico central, sin rodeos" },
    // ORDENADAS: la versión corta del informe solo muestra las 2 primeras
    // fortalezas y LA primera carencia. Si el orden es arbitrario, el prospecto
    // recibe lo menos interesante que teníamos.
    fortalezas: {
      type: "array",
      items: { type: "string" },
      description:
        "3 a 4 fortalezas reales, DE MAYOR A MENOR. Las dos primeras son las que más lo van a sorprender: con número o evidencia textual de su perfil.",
    },
    carencias: {
      type: "array",
      items: { type: "string" },
      description:
        "3 a 4 carencias accionables, DE MAYOR A MENOR. La PRIMERA se entrega completa y sola a los que aún no son clientes: tiene que valer por sí misma — qué está pasando, con qué evidencia, y qué haría distinto. Que se pueda actuar sobre ella sin nosotros.",
    },
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
          estado: { type: "string", enum: ["activo", "fuerte", "irregular", "débil", "ausente", "por confirmar"] },
          nota: { type: "string", description: "Diagnóstico corto del canal" },
          recomendacion: { type: "string", description: "Qué hacer (servicio Bushido cuando aplica)" },
        },
        required: ["canal", "estado", "nota", "recomendacion"],
      },
    },
    metricas: {
      type: "array",
      description: "3 métricas a vigilar SEGÚN EL FOCO (no siempre de redes), sin inventar números",
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
        precio: { type: "string", description: "Precio EXACTO del tier recomendado, copiado de la lista, ej: '$3.900.000 / mes'" },
        precioDesde: { type: "string", description: "Precio de entrada de esa familia (ancla 'desde'), ej: '$2.500.000 / mes'" },
        porque: { type: "string", description: "Por qué ese paquete para esta etapa" },
        incentivo: { type: "string", description: "Bono por arrancar este mes que tapa una carencia (NO descuento)" },
      },
      required: ["nombre", "precio", "precioDesde", "porque", "incentivo"],
    },
  },
  required: [
    "nicho", "categoria", "perfil", "etapa", "resumen", "fortalezas", "carencias", "oportunidades",
    "buyerPersona", "gatillos", "emociones", "canales", "metricas",
    "propuesta", "paquete",
  ],
} as const;

/**
 * El esquema del turno: con los campos de sector solo si hay data que los
 * sostenga, y con otra instrucción para las fortalezas cuando no vimos su
 * cuenta (el abrebocas las titula "lo que ya estás haciendo bien": sin datos,
 * esa pregunta solo se puede contestar inventando).
 */
function esquema(conSector: boolean, conDatos: boolean) {
  const properties: Record<string, unknown> = { ...SCHEMA_BASE.properties };
  if (!conDatos) {
    properties.fortalezas = {
      type: "array",
      items: { type: "string" },
      description:
        "3 a 4 ventajas de partida, DE MAYOR A MENOR. NO viste su cuenta: básalas en lo que el cliente escribió, en su web (si la leímos) y en su categoría. Escríbelas como lo que TIENE A FAVOR ('tienes a favor…', 'tu categoría te da…'), NUNCA como algo que viste en su perfil.",
    };
  }
  if (conSector) Object.assign(properties, CAMPOS_SECTOR);
  return {
    ...SCHEMA_BASE,
    properties,
    required: conSector ? [...SCHEMA_BASE.required, "datoSector", "cierreGancho"] : [...SCHEMA_BASE.required],
  };
}

interface ModelOut {
  nicho: string;
  categoria: Nicho;
  perfil: PerfilLead;
  etapa: EtapaMarca;
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
  datoSector?: Analisis["datoSector"];
  cierreGancho?: string;
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

/** La línea de TikTok del mensaje: qué sabemos de verdad de esa cuenta. */
function lineaTiktok(valor: string | undefined, tt: VerificacionTiktok | null): string {
  if (!valor || !tt) return "TikTok: (no lo compartió — NO lo incluyas en canales)";
  if (tt.estado === "verificado") {
    return `TikTok: @${tt.usuario} — confirmamos que la cuenta existe${tt.nombre ? ` (nombre visible: "${tt.nombre}")` : ""}. NO tenemos sus métricas ni sus videos: no opines de su contenido.`;
  }
  if (tt.estado === "no_encontrado") {
    return `TikTok: escribió "${valor}", pero esa cuenta NO apareció en TikTok (puede estar mal escrita, haber cambiado o ser privada). Inclúyelo como "por confirmar" y pídele revisar el usuario; no afirmes que no existe.`;
  }
  return `TikTok: ${valor} (lo compartió; no pudimos verificarlo ahora. No opines de su contenido.)`;
}

/**
 * Cuánto puede esperar al modelo por intento. El SDK REINTENTA los timeouts,
 * así que el peor caso es timeout × 2. Antes eran 50s × 2 dentro de una ruta
 * de 60s: cuando el modelo tardaba, Vercel mataba la función sin dejar rastro
 * (24 de los 30 leads sin informe). Ahora las rutas tienen 300s y esto cabe:
 * 12s Instagram/web + 16s sector + 2 × 120s modelo = 268s.
 */
const MODEL_TIMEOUT_MS = Number(process.env.MODEL_TIMEOUT_MS || 120_000);

/** Genera el análisis con Claude a partir de lo que SÍ pudimos leer. null si no hay API key. */
export async function generarAnalisis(input: AnalizarInput): Promise<Analisis | null> {
  if (!KEY) {
    console.warn("[analizar] SIN ANTHROPIC_API_KEY — configúrala en Vercel para el análisis automático.");
    return null;
  }
  const client = new Anthropic({ apiKey: KEY });
  const t0 = Date.now();

  // Si en el campo Instagram pegaron su web o su portafolio, eso es su web.
  const webEnInstagram = pareceWebNoInstagram(input.redes);
  const webDada = input.web || webEnInstagram || undefined;

  // PASO 1: lo que se puede leer de verdad — Instagram, su web y (solo en modo
  // profundo) la búsqueda en internet. En paralelo: ninguno depende del otro.
  const [ig, sitioDado, tt, brief] = await Promise.all([
    perfilInstagram(input.redes),
    webDada ? leerWeb(webDada) : Promise.resolve(null),
    input.tiktok ? verificarTiktok(input.tiktok) : Promise.resolve(null),
    input.profundo ? investigar(client, input) : Promise.resolve(""),
  ]);
  // Si no nos dio web pero la tiene en la bio de Instagram, se lee esa (antes
  // el informe decía "tienes bushidoav.com en la bio pero no nos lo
  // compartiste"). Un link a WhatsApp no es una web.
  const webDeBio = !webDada && ig.website && !/wa\.me|whatsapp\.com|api\.whatsapp/i.test(ig.website) ? ig.website : undefined;
  const web = webDada || webDeBio;
  const sitio = webDada ? sitioDado : webDeBio ? await leerWeb(webDeBio) : null;
  console.log(
    `[analizar] fuentes en ${Date.now() - t0}ms · instagram=${ig.estado} · web=${sitio ? (sitio.ok ? "leida" : `no (${sitio.error})`) : "no compartida"} · tiktok=${tt ? `${tt.estado}${tt.detalle ? ` (${tt.detalle})` : ""}` : "no compartido"}`
  );

  // PASO 2: lo que el cerebro ya sabe de ese sector. Va DESPUÉS de Instagram y
  // de la web: su bio y sus textos son los que permiten acertarle a la
  // categoría. El FOCO ("Un videoclip", "Cobertura de evento") NO entra: eso es
  // lo que pide, no lo que es — y antes convertía a cualquiera en "Fotografía".
  const sector = await briefingDelSector(
    [input.marca, ig.pistas, sitio?.ok ? sitio.pistas : ""].filter(Boolean).join(" ")
  );
  const briefing = briefingParaPrompt(sector);

  const conDatos = ig.estado === "leido";
  const lineaWeb = !web
    ? "Sitio web: (no nos compartió sitio web ni hay una web en su bio)"
    : sitio?.ok
      ? `Sitio web: ${web}${webDeBio ? " (no nos la dio: es el enlace de su bio)" : ""} (leído — ver abajo)`
      : `Sitio web: ${web} (lo compartió, pero NO lo pudimos abrir: ${sitio?.error ?? "sin detalle"}. No opines de su contenido.)`;

  // PASO 3: estructurar el análisis usando esos hechos
  const userMsg = bienFormado(
    [
      `Marca: ${input.marca}`,
      webEnInstagram
        ? `Instagram: (no lo compartió — en ese campo escribió su web: ${webEnInstagram}. NO incluyas Instagram en canales)`
        : `Instagram: ${input.redes || "(no lo compartió)"}`,
      lineaTiktok(input.tiktok, tt),
      lineaWeb,
      ``,
      `>>> FOCO DEL ANÁLISIS (lo que el cliente eligió): ${input.contexto || "(no especificó → enfoque general de redes)"}`,
      `Todo el informe debe leerse desde ese foco, no solo desde redes sociales.`,
      "",
      // Sin datos reales el prompt le exige evidencia concreta al modelo y no le
      // da ninguna: esa combinación es la que produce cifras inventadas. Aquí se
      // le dice explícitamente qué NO puede afirmar, según el motivo real.
      ig.texto || (webEnInstagram ? avisoSinInstagram({ ...ig, estado: "no_compartido" }) : avisoSinInstagram(ig, input.redes)),
      "",
      sitio?.ok ? sitio.texto ?? "" : "",
      "",
      briefing,
      "",
      brief
        ? `INVESTIGACIÓN WEB (hechos reales — BÁSATE en esto, no inventes más allá de lo aquí verificado):\n${brief}`
        : "",
      "",
      "Analiza esta marca y devuelve el informe estructurado. Recuerda: primero QUÉ ES (perfil), después la regla de honestidad de canales, y recomienda el servicio que resuelve lo que el cliente busca.",
    ]
      .filter((l) => l !== "")
      .join("\n")
  );

  // Config que YA funcionaba en producción (modelo, thinking, effort, schema).
  // Lo único que cambia es el tiempo: ver MODEL_TIMEOUT_MS.
  const t1 = Date.now();
  const res = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        format: { type: "json_schema", schema: esquema(Boolean(sector), conDatos) },
        effort: "medium",
      },
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    },
    { timeout: input.timeoutMs ?? MODEL_TIMEOUT_MS, maxRetries: 1 }
  );
  console.log(
    `[analizar] informe estructurado en ${Date.now() - t1}ms (total ${Date.now() - t0}ms, profundo=${!!input.profundo}, stop=${res.stop_reason})`
  );

  // Un corte o una negativa dejan el JSON incompleto: mejor un error claro que
  // un "Unexpected end of JSON input" en el panel.
  if (res.stop_reason === "max_tokens") throw new Error("El modelo se quedó sin espacio (max_tokens) antes de terminar el informe.");
  if (res.stop_reason === "refusal") throw new Error("El modelo se negó a generar este informe.");
  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("El modelo no devolvió contenido de texto.");
  }
  const data = JSON.parse(textBlock.text) as ModelOut;

  // taxonomía plana (para consultar/comparar) derivada del detalle
  const emociones = (data.emociones ?? []).map((e) => e.emocion) as Emocion[];

  const fuentes: FuentesInforme = {
    instagram: webEnInstagram ? "usuario_invalido" : ig.estado,
    instagramDetalle: ig.detalle,
    web: !web ? "no_compartida" : sitio?.ok ? "leida" : "no_se_pudo",
    webDetalle: sitio?.ok ? sitio.url : sitio?.error,
    tiktok: tt ? tt.estado : "no_compartido",
    tiktokDetalle: tt ? [tt.usuario && `@${tt.usuario}`, tt.nombre, tt.detalle].filter(Boolean).join(" · ") || undefined : undefined,
    sector: Boolean(sector),
  };

  return {
    marca: input.marca,
    redes: input.redes,
    web,
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
    datoSector: data.datoSector,
    cierreGancho: data.cierreGancho,
    // Qué sabíamos del sector al escribir esto: sirve para citar la muestra
    // en el informe y para saber si el dato se puede afirmar o solo insinuar.
    sector: sector
      ? { categoria: sector.categoria, marcas: sector.marcas, suficiente: sector.suficiente }
      : undefined,
    estado: "analizado",
    modo: input.abrebocas ? "abrebocas" : "completo",
    // Si es false, el informe se escribió sin ver su cuenta: no cita métricas
    // ni publicaciones y no debe alimentar la "data del sector".
    conDatosReales: conDatos,
    perfil: { tipo: data.perfil, etapa: data.etapa, fuentes },
  };
}
