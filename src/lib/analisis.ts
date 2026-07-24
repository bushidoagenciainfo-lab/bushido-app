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
export type EstadoCanal = "fuerte" | "irregular" | "débil" | "ausente" | "por confirmar";
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

export interface Analisis {
  // — cliente —
  marca: string;
  nicho: string;
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
  // — propuesta —
  propuesta: string;
  paquete: PaqueteRecomendado;
  // — pipeline —
  estado?: "nuevo" | "analizado" | "enviado" | "seguimiento" | "cerrado";
}

// Análisis de ejemplo (cliente real: Bianco Bake Lab) — para previsualizar la plantilla.
export const DEMO_ANALISIS: Analisis = {
  marca: "Bianco Bake Lab",
  nicho: "Repostería artesanal · gastronomía",
  redes: "@biancobakelab",
  web: "—",
  fecha: "2026",
  resumen:
    "Producto con alma y estética envidiable, pero la comunicación no está capitalizando el deseo ni la ocasión de compra. Hay una mina de contenido emocional sin explotar.",
  fortalezas: [
    "Producto fotogénico y de calidad evidente",
    "Identidad visual cálida y coherente",
    "Comunidad pequeña pero fiel que comenta",
  ],
  carencias: [
    "Reels sin hook — se ve rico pero no detiene el scroll",
    "No comunica ocasión de compra (regalo, antojo, celebración)",
    "Poca constancia: publica en ráfagas, no en ritmo",
  ],
  oportunidades: [
    "El 'antojo' y el 'date un gusto' son emociones sin dueño en el nicho",
    "Contenido de proceso (BTS del horneado) genera confianza y deseo",
    "Alianzas con cafés y creadores de la zona",
  ],
  buyerPersona: {
    nombre: "La que se da el gusto bonito",
    descripcion:
      "Mujer 25–45 en Bogotá, ingreso medio-alto, valora lo artesanal por encima de lo industrial. Compra para celebrar, regalar o premiarse, y le importa que se vea tan bien como sabe.",
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
    { canal: "Google / reseñas", estado: "ausente", nota: "Sin ficha de Google Business ni reseñas: invisible para quien busca 'postres artesanales Bogotá'.", recomendacion: "Abrir Google Business + estrategia de reseñas. Prueba social que convierte." },
    { canal: "TikTok", estado: "por confirmar", nota: "No nos compartiste tu TikTok — cuéntanos si lo tienes. El nicho gastronómico rinde fuerte en formato corto y crudo.", recomendacion: "Si aún no estás, abrir cuenta y reutilizar reels de proceso adaptados al tono más crudo de TikTok." },
  ],
  metricas: [
    { nombre: "Retención de reels (primeros 3s)", queMirar: "% que no hace scroll en los primeros segundos.", porQue: "Mide si el hook funciona — el mayor problema hoy es que se ve rico pero no detiene." },
    { nombre: "Guardados y compartidos", queMirar: "Guardados por reel y envíos por DM.", porQue: "En gastronomía el guardado ('lo quiero pedir') predice ventas mejor que los likes." },
    { nombre: "Alcance de no-seguidores", queMirar: "% del alcance que viene de cuentas que no te siguen.", porQue: "Indica si el contenido está trayendo gente nueva o solo hablándole a los de siempre." },
  ],
  propuesta:
    "Un sistema de contenido mensual con ritmo fijo: reels de antojo con hooks fuertes, BTS del proceso para confianza, y campañas por ocasión (regalo, celebración). Todo guiado por la data de tu marca y la data que hemos creado en gastronomía.",
  paquete: {
    nombre: "Paquete de redes · Crecimiento",
    precio: "$3.200.000 / mes",
    precioDesde: "$2.000.000 / mes",
    porque:
      "Necesitas volumen y constancia (10 reels + fotos + gestión + campañas), no piezas sueltas. Es el que mueve la aguja en tu etapa.",
    incentivo:
      "Si arrancas este mes, te montamos tu Google Business + primeras reseñas sin costo — justo la carencia que hoy te deja invisible en búsquedas.",
  },
  estado: "analizado",
};
