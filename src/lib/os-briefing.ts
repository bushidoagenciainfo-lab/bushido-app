// Consulta al cerebro QUÉ SABEMOS YA de una categoría, antes de escribir un
// diagnóstico nuevo. Es lo que convierte cada análisis en aprendizaje
// acumulado en vez de empezar de cero cada vez.

import { leerDelOS } from "./bushido-os";

interface Briefing {
  ok: boolean;
  conocida: boolean;
  categoria?: string;
  marcas_analizadas?: number;
  suficiente?: boolean;
  carencias_tipicas?: string[];
  emociones_del_sector?: string[];
  canales_desatendidos?: string[];
  oportunidades_repetidas?: string[];
  transferencias?: Array<{ palanca?: string; lectura?: string }>;
  advertencia?: string;
  mensaje?: string;
  categorias_conocidas?: string[];
}

/** "Gastronomía / restaurante" → "gastronomia-restaurante" */
function aSlug(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Busca el briefing de la categoría más probable a partir de las pistas que
 * tenemos del cliente (marca, qué pidió, su biografía).
 *
 * Hace como mucho dos llamadas: la directa y, si no la reconoce, un intento
 * contra la lista de categorías que el OS sí conoce.
 */
export async function briefingParaPrompt(pistas: string): Promise<string> {
  if (!pistas.trim()) return "";

  const primera = await leerDelOS<Briefing>(
    `/api/sitio/briefing?categoria=${encodeURIComponent(aSlug(pistas.slice(0, 60)))}`
  );
  // Si el OS rechazó (llave mal, caído…), el análisis sigue sin su briefing:
  // vale más un diagnóstico sin data de sector que ninguno.
  if (!primera.ok) {
    console.warn(`[briefing] sin data del sector: ${primera.detalle || primera.error}`);
    return "";
  }
  let b = primera.data;

  // Segundo intento: ¿alguna categoría conocida aparece en las pistas?
  if (!b.conocida && b.categorias_conocidas?.length) {
    const texto = aSlug(pistas);
    const match = b.categorias_conocidas.find((c) => {
      const s = aSlug(c);
      return texto.includes(s) || s.split("-").some((p) => p.length > 4 && texto.includes(p));
    });
    if (match) {
      const segunda = await leerDelOS<Briefing>(
        `/api/sitio/briefing?categoria=${encodeURIComponent(match)}`
      );
      if (segunda.ok) b = segunda.data;
    }
  }

  if (!b.ok || !b.conocida) return "";

  const lista = (titulo: string, items?: string[]) =>
    items?.length ? `${titulo}: ${items.join(" · ")}` : "";

  const bloques = [
    `LO QUE YA SABEMOS DE ESTA CATEGORÍA (${b.categoria}, ${b.marcas_analizadas} marcas analizadas por Bushido).`,
    "Es data propia acumulada: úsala para ir más profundo y para comparar a esta marca con su sector,",
    "NO para repetirla tal cual. Si algo de esta marca contradice el patrón, eso es lo interesante — dilo.",
    "",
    lista("Carencias que se repiten en el sector", b.carencias_tipicas),
    lista("Emociones que mueven la compra aquí", b.emociones_del_sector),
    lista("Canales que casi nadie atiende", b.canales_desatendidos),
    lista("Oportunidades que aparecen una y otra vez", b.oportunidades_repetidas),
    b.transferencias?.length
      ? "Palancas que funcionan en otros sectores y aquí nadie usa: " +
        b.transferencias.map((t) => t.lectura || t.palanca).filter(Boolean).join(" · ")
      : "",
    b.advertencia ? `⚠️ ${b.advertencia}` : "",
    b.suficiente === false
      ? "⚠️ La muestra del sector todavía es corta: NO presentes estos patrones como verdades del mercado."
      : "",
  ].filter(Boolean);

  return bloques.join("\n");
}
