// Modelo estructurado del ANÁLISIS (7 maletas + diagnóstico + presencia + propuesta).
// Cada análisis alimenta la base de datos de Bushido: nichos, fortalezas,
// carencias y — clave — las emociones que mueven a los clientes de cada nicho.

// Taxonomía CONTROLADA de emociones (vocabulario fijo → data consistente y comparable)
export const EMOCIONES = [
  "Pertenencia",
  "Estatus",
  "Nostalgia",
  "Seguridad",
  "Deseo",
  "Aspiración",
  "Diversión",
  "Confianza",
  "Urgencia",
  "Orgullo",
  "Sorpresa",
  "Cercanía",
] as const;
export type Emocion = (typeof EMOCIONES)[number];

// Categoría de nicho CONTROLADA (para agrupar la data: "los 10 fotógrafos").
// El `nicho` sigue siendo texto libre y descriptivo; esta es la etiqueta para agrupar.
export const NICHOS = [
  "Música / artista",
  "Moda / ropa",
  "Gastronomía / restaurante",
  "Repostería",
  "Fotografía",
  "Belleza / estética",
  "Fitness / salud",
  "Inmobiliaria",
  "Automotriz",
  "Educación / cursos",
  "Tecnología / software",
  "Retail / producto",
  "Servicios profesionales",
  "Eventos",
  "Hotelería / turismo",
  "Otro",
] as const;
export type Nicho = (typeof NICHOS)[number];

/**
 * Lleva cualquier texto de nicho a UNA de las categorías cerradas.
 *
 * Sin esto, "Fotografía" y "Fotografía profesional · servicios creativos"
 * son dos grupos distintos: dos grupos de 3 marcas no forman patrón, uno de 6
 * sí. La categoría manda sobre el nicho descriptivo, que sigue siendo libre.
 */
const REGLAS: Array<{ cat: Nicho; claves: string[] }> = [
  { cat: "Repostería", claves: ["reposter", "pasteler", "panader", "cake", "postre", "dulce", "brownie", "galleta"] },
  { cat: "Gastronomía / restaurante", claves: ["gastronom", "restaurante", "comida", "cocina", "food", "bar ", "cafeter", "cafe", "pizzer", "hamburgues", "catering", "heladeria"] },
  { cat: "Música / artista", claves: ["music", "artista", "cantante", "banda", "dj", "sello", "disquera", "reggaeton", "concierto"] },
  // Hotelería va ANTES que Moda: "hotel boutique" no es una tienda de ropa.
  { cat: "Hotelería / turismo", claves: ["hotel", "turism", "hosped", "hostal", "viaje", "glamping", "finca "] },
  { cat: "Moda / ropa", claves: ["moda", "ropa", "textil", "indument", "streetwear", "calzado", "zapat", "joyer", "accesorio"] },
  { cat: "Belleza / estética", claves: ["belleza", "estetic", "peluquer", "barber", "spa", "uñas", "cosmetic", "skincare", "maquillaje"] },
  { cat: "Fitness / salud", claves: ["fitness", "gimnasio", "gym", "salud", "nutric", "entrenador", "crossfit", "yoga", "medic", "odontolog", "psicolog"] },
  { cat: "Fotografía", claves: ["fotograf", "foto ", "audiovisual", "video", "producci", "cinemat", "content creator"] },
  { cat: "Inmobiliaria", claves: ["inmobili", "bienes raices", "finca raiz", "propiedad", "arriendo", "construct"] },
  { cat: "Automotriz", claves: ["automotr", "carro", "vehicul", "taller mecanic", "moto", "concesionar", "llanta"] },
  { cat: "Educación / cursos", claves: ["educac", "curso", "academia", "colegio", "universidad", "formacion", "capacitac", "instituto"] },
  { cat: "Tecnología / software", claves: ["tecnolog", "software", "app ", "saas", "desarrollo web", "sistemas", "digital agency", "startup"] },
  { cat: "Retail / producto", claves: ["retail", "tienda", "ecommerce", "e-commerce", "producto", "venta de", "distribuidor", "mayorista", "supermercado"] },
  { cat: "Eventos", claves: ["evento", "boda", "matrimonio", "fiesta", "celebrac", "wedding", "logistica de evento"] },
  { cat: "Servicios profesionales", claves: ["abogad", "juridic", "contab", "consultor", "asesor", "financier", "seguro", "arquitect", "ingenier"] },
];

export function normalizarCategoria(...textos: Array<string | null | undefined>): Nicho {
  const t = textos
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!t.trim()) return "Otro";

  // Si ya viene una categoría válida escrita igual, respétala.
  const exacta = NICHOS.find(
    (n) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === t.trim()
  );
  if (exacta) return exacta;

  for (const r of REGLAS) {
    if (r.claves.some((k) => t.includes(k))) return r.cat;
  }
  return "Otro";
}

// Cada emoción con el ARGUMENTO de por qué mueve la compra en esta marca
export interface EmocionDetalle {
  emocion: Emocion;
  porque: string;
}

// "Gatillos" de compra (antes "maletas"): el motivo real detrás de la compra.
export interface Gatillo {
  nombre: string;
  insight: string;
}

export interface BuyerPersona {
  nombre: string;
  descripcion: string;
  jtbd: string[]; // jobs-to-be-done: qué "trabajo" contrata el cliente al comprar
}

// Auditoría de presencia digital: cada canal con su estado y qué hacer.
// Aquí afloran las carencias-servicio: "no tiene web", "no tiene reseñas", etc.
export type EstadoCanal = "activo" | "fuerte" | "irregular" | "débil" | "ausente" | "por confirmar";
export interface Canal {
  canal: string; // "Instagram", "Sitio web", "Google / reseñas", "TikTok", "YouTube"...
  estado: EstadoCanal;
  nota: string; // diagnóstico corto
  recomendacion: string; // qué hacer (mapea a un servicio Bushido cuando aplica)
}

// Métricas de redes a vigilar (sin inventar números: qué medir y por qué)
export interface Metrica {
  nombre: string; // "Retención en reels", "Guardados", "Alcance de no-seguidores"...
  queMirar: string;
  porQue: string;
}

export interface PaqueteRecomendado {
  nombre: string;
  precio: string; // precio real del tier (referencia)
  precioDesde?: string; // ancla que se muestra: precio de entrada de la familia, ej "$2.000.000 / mes"
  porque: string;
  incentivo?: string; // bono por arrancar ya, personalizado a una carencia (NO descuento)
}

/**
 * El dato de sector: lo que sabemos por haber analizado otras marcas de su
 * categoría. Es la pieza de autoridad del informe — sin el número delante no
 * demuestra nada, así que siempre va con la evidencia.
 */
export interface DatoSector {
  hallazgo: string; // "De las 8 marcas de repostería que hemos analizado, la carencia más repetida es X"
  veredicto: string; // dónde queda ESTA marca frente a ese patrón
}

/** Qué sabíamos del sector al generar el informe (para citar la muestra). */
export interface MuestraSector {
  categoria: string;
  marcas: number;
  suficiente: boolean; // false → hay que decir "entre lo que hemos analizado", no "el sector"
}

export interface Analisis {
  // — cliente —
  marca: string;
  nicho: string; // texto libre descriptivo, ej "Repostería artesanal · gastronomía"
  categoria?: Nicho; // etiqueta controlada para agrupar la data
  redes?: string;
  web?: string;
  fecha: string;
  // — diagnóstico —
  resumen: string;
  fortalezas: string[];
  carencias: string[];
  oportunidades: string[];
  // — quién compra —
  buyerPersona: BuyerPersona;
  // — gatillos / drivers de compra —
  gatillos: Gatillo[];
  emociones: Emocion[]; // taxonomía fija (para consultar/comparar la data)
  emocionesDetalle?: EmocionDetalle[]; // el porqué de cada emoción (para el informe)
  // — presencia digital + métricas —
  canales?: Canal[];
  metricas?: Metrica[];
  // — lo que sabemos de su sector (solo si el cerebro conocía la categoría) —
  datoSector?: DatoSector;
  cierreGancho?: string; // la transferencia: oportunidad nombrada, ejecución no
  sector?: MuestraSector;
  /**
   * ¿Se pudo leer su cuenta de Instagram al escribirlo? Si es false el informe
   * salió sin métricas ni textos reales — hay que revisarlo antes de enviarlo.
   * Los informes viejos no lo traen: por eso es opcional, no false por defecto.
   */
  conDatosReales?: boolean;
  // — propuesta —
  propuesta: string;
  paquete: PaqueteRecomendado;
  // — pipeline —
  estado?: "nuevo" | "analizado" | "enviado" | "seguimiento" | "cerrado";
  /**
   * "abrebocas" = el informe gratis que pide un desconocido por el pop-up:
   * 2 fortalezas, UNA carencia completa, el dato de sector y qué NO incluye.
   * "completo" = todo (clientes y panel). Por defecto completo.
   */
  modo?: "abrebocas" | "completo";
}

// Análisis de ejemplo (cliente real: Bianco Bake Lab) — para previsualizar la plantilla.
export const DEMO_ANALISIS: Analisis = {
  marca: "Bianco Bake Lab",
  nicho: "Repostería artesanal · gastronomía",
  categoria: "Repostería",
  redes: "@biancobakelab",
  web: "—",
  fecha: "2026",
  resumen:
    "Producto con alma y estética envidiable, pero la comunicación no está capitalizando el deseo ni la ocasión de compra. Hay una mina de contenido emocional sin explotar.",
  // Ordenadas de mayor a menor: la versión corta muestra las 2 primeras
  // fortalezas y la primera carencia, así que son las que más pesan.
  fortalezas: [
    "Tus fotos de producto tienen un nivel que la mayoría de tu competencia no tiene. Eso es exactamente lo que sostiene un precio por encima del de una panadería de barrio: la foto justifica la cifra antes de que el cliente pregunte.",
    "Operas en dos plazas, Cúcuta y Bogotá, con una sola marca y una sola voz. Es una ventaja poco común en repostería artesanal y hoy no aparece por ningún lado en tu contenido.",
    "Tu comunidad es pequeña pero responde: comenta y pregunta precios. Quien ya te sigue está listo para comprar — el cuello de botella está antes, en llegar a alguien nuevo.",
  ],
  carencias: [
    "Tu bio limita los pedidos a Cúcuta y Bogotá y ninguna publicación lo dice. El que te descubre desde otra ciudad se ilusiona, escribe y se lleva un «no llegamos allá»; y el que sí está en tus dos ciudades no tiene claro que puede pedirte. Un post fijado con cobertura, tiempos y cómo pedir resuelve las dos cosas esta semana.",
    "Vendes torta, no ocasión. El contenido no nombra el cumpleaños, el aniversario ni el «me lo merezco» — que es justo cuando alguien decide pagar por repostería cara.",
    "Publicas en ráfagas y luego desapareces. Tu cuenta no compite contra otra repostería: compite contra el olvido.",
  ],
  oportunidades: [
    "El 'antojo' y el 'date un gusto' son emociones sin dueño en el nicho",
    "Contenido de proceso (BTS del horneado) genera confianza y deseo",
    "Alianzas con cafés y creadores de la zona",
  ],
  buyerPersona: {
    nombre: "La que se da el gusto bonito",
    descripcion:
      "Mujer 25–45 en Cúcuta y Bogotá, ingreso medio-alto, valora lo artesanal por encima de lo industrial. Compra para celebrar, regalar o premiarse, y le importa que se vea tan bien como sabe.",
    jtbd: [
      "Darse un gusto sin culpa",
      "Quedar bien con un detalle en una reunión",
      "Sentir que se merece algo especial",
    ],
  },
  gatillos: [
    { nombre: "Antojo", insight: "La compra es impulsiva y emocional — el contenido debe provocar hambre visual, no informar." },
    { nombre: "Ocasión", insight: "Se compra para un momento (regalo, celebración, café de la tarde). Falta nombrar esas ocasiones." },
    { nombre: "Estatus accesible", insight: "Es el lujo que sí se puede pagar — comunicar 'te lo mereces' más que 'es barato'." },
    { nombre: "Confianza", insight: "El proceso artesanal y los ingredientes reales generan la confianza que justifica el precio." },
  ],
  emociones: ["Deseo", "Nostalgia", "Orgullo", "Cercanía", "Sorpresa"],
  emocionesDetalle: [
    { emocion: "Deseo", porque: "El primer motor: la textura y el corte disparan el antojo antes de que exista una razón racional para comprar." },
    { emocion: "Nostalgia", porque: "Lo artesanal evoca 'lo de antes', lo de la abuela — un sabor con memoria que lo industrial no puede imitar." },
    { emocion: "Orgullo", porque: "Regalar o servir algo hecho a mano dice algo de quien lo elige: buen gusto, cuidado, criterio." },
    { emocion: "Cercanía", porque: "La marca pequeña con rostro y proceso visible se siente humana; se le compra a alguien, no a una fábrica." },
    { emocion: "Sorpresa", porque: "El 'no sabía que existía esto' del descubrimiento es lo que hace que se comparta y se recomiende." },
  ],
  canales: [
    { canal: "Instagram", estado: "irregular", nota: "Es el canal principal pero publica en ráfagas y los reels no retienen.", recomendacion: "Sistema de contenido con ritmo fijo: reels de antojo + BTS + campañas por ocasión." },
    { canal: "Sitio web", estado: "ausente", nota: "No hay web: toda la conversión depende del DM, que se pierde y no escala.", recomendacion: "Landing de pedidos + catálogo (menú, ocasiones, cómo encargar). Servicio Bushido." },
    { canal: "Google / reseñas", estado: "ausente", nota: "Sin ficha de Google Business ni reseñas: invisible para quien busca 'postres artesanales' en tus dos ciudades, que es justo donde sí puedes despachar.", recomendacion: "Abrir Google Business en Cúcuta y Bogotá + estrategia de reseñas. Prueba social que convierte." },
    { canal: "TikTok", estado: "activo", nota: "Ya tienes presencia y el nicho gastronómico rinde fuerte en formato corto y crudo — es el canal con más alcance orgánico por explotar.", recomendacion: "Reutilizar los reels de proceso con el tono más crudo de TikTok: corte lento, sonido real, cero locución." },
  ],
  metricas: [
    { nombre: "Retención de reels (primeros 3s)", queMirar: "% que sigue viendo pasados los primeros segundos.", porQue: "Te dice si el problema es el contenido o la distribución: si retiene y no crece, no es el video, es el alcance." },
    { nombre: "Guardados y compartidos", queMirar: "Guardados por reel y envíos por DM.", porQue: "En gastronomía el guardado ('lo quiero pedir') predice ventas mejor que los likes." },
    { nombre: "Alcance de no-seguidores", queMirar: "% del alcance que viene de cuentas que no te siguen.", porQue: "Indica si el contenido está trayendo gente nueva o solo hablándole a los de siempre." },
  ],
  propuesta:
    "Un sistema de contenido mensual con ritmo fijo: reels de antojo con hooks fuertes, BTS del proceso para confianza, y campañas por ocasión (regalo, celebración). Todo guiado por la data de tu marca y la data que hemos creado en gastronomía.",
  paquete: {
    nombre: "Sistema de crecimiento · Evolution",
    precio: "$3.900.000 / mes",
    precioDesde: "$2.500.000 / mes",
    porque:
      "Necesitas un sistema con ritmo, no piezas sueltas: la estrategia decide qué se produce cada mes y se corrige con lo que la data va mostrando. Es lo que mueve la aguja en tu etapa.",
    incentivo:
      "Si arrancas este mes te montamos el Google Business de Cúcuta y Bogotá con las primeras reseñas — justo la carencia que hoy te deja invisible en búsquedas.",
  },
  datoSector: {
    hallazgo:
      "De las 8 marcas de repostería que hemos analizado, la carencia más repetida es la misma: muestran el producto terminado y nunca el proceso.",
    veredicto:
      "Tu cuenta la comparte: se ve el resultado, no el taller. Y es justo el proceso lo que justifica tu precio frente al de una panadería de barrio.",
  },
  cierreGancho:
    "En estética y en fitness lleva dos años funcionando algo que en repostería casi nadie usa: el antes y después con la persona que compra, no con el producto. La torta no es el resultado — la cara de quien la recibe sí. Cómo se aplica eso a tu marca, con qué formato y en qué momento del mes, es parte de lo que trabajamos con clientes.",
  sector: { categoria: "Repostería", marcas: 8, suficiente: true },
  estado: "analizado",
};
