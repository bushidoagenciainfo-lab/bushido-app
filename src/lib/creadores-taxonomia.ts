// Taxonomía del book de creadores SIN dependencias de servidor (node:fs, supabase),
// para poder importarla desde componentes cliente.

// Nichos: alineados con la taxonomía de análisis (para cruzar con la data).
export const NICHOS_CREADOR = [
  "Gastronomía",
  "Moda",
  "Belleza",
  "Fitness / salud",
  "Música",
  "Lifestyle",
  "Tecnología",
  "Viajes",
  "Hogar / deco",
  "Automotriz",
  "Familia / bebés",
  "Negocios / finanzas",
  "Humor / entretenimiento",
  "Otro",
] as const;

// Formatos: el "qué sabe hacer" — clave para el casting.
export const FORMATOS_CREADOR = [
  "UGC sin rostro",
  "Talking head (a cámara)",
  "Reseña / testimonio",
  "Unboxing",
  "Tutorial / how-to",
  "Lifestyle / día a día",
  "Humor / sketch",
  "Voz en off",
  "Fotografía de producto",
  "Streaming / en vivo",
] as const;

export type NichoCreador = (typeof NICHOS_CREADOR)[number];
export type FormatoCreador = (typeof FORMATOS_CREADOR)[number];
