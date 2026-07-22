// Modelo estructurado del ANÁLISIS (7 maletas + diagnóstico + propuesta).
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

// Las 7 maletas: cada "maleta" es un motivo (racional/emocional) detrás de la compra.
export interface Maleta {
  nombre: string;
  insight: string;
}

export interface BuyerPersona {
  nombre: string;
  descripcion: string;
  jtbd: string[]; // jobs-to-be-done: qué "trabajo" contrata el cliente al comprar
}

export interface PaqueteRecomendado {
  nombre: string;
  precio: string;
  porque: string;
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
  // — 7 maletas / drivers de compra —
  maletas: Maleta[];
  emociones: Emocion[];
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
    nombre: "La que se premia",
    descripcion:
      "Mujer 25–40, trabaja duro, busca pequeños lujos accesibles. Compra por antojo y para compartir un momento, no solo por hambre.",
    jtbd: [
      "Darse un gusto sin culpa",
      "Quedar bien con un detalle en una reunión",
      "Sentir que se merece algo especial",
    ],
  },
  maletas: [
    { nombre: "Antojo", insight: "La compra es impulsiva y emocional — el contenido debe provocar hambre visual, no informar." },
    { nombre: "Ocasión", insight: "Se compra para un momento (regalo, celebración, café de la tarde). Falta nombrar esas ocasiones." },
    { nombre: "Estatus accesible", insight: "Es el lujo que sí se puede pagar — comunicar 'te lo mereces' más que 'es barato'." },
    { nombre: "Confianza", insight: "El proceso artesanal y los ingredientes reales generan la confianza que justifica el precio." },
  ],
  emociones: ["Deseo", "Nostalgia", "Cercanía", "Orgullo"],
  propuesta:
    "Un sistema de contenido mensual con ritmo fijo: reels de antojo con hooks fuertes, BTS del proceso para confianza, y campañas por ocasión (regalo, celebración). Todo guiado por la data de tu marca y la data que hemos creado en gastronomía.",
  paquete: {
    nombre: "Paquete de redes · Crecimiento",
    precio: "$3.200.000 / mes",
    porque:
      "Necesitas volumen y constancia (10 reels + fotos + gestión + campañas), no piezas sueltas. Es el que mueve la aguja en tu etapa.",
  },
  estado: "analizado",
};
