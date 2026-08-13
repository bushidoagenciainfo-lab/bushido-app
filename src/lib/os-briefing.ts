// Consulta al cerebro QUÉ SABEMOS YA de una categoría, antes de escribir un
// diagnóstico nuevo. Es lo que convierte cada análisis en aprendizaje
// acumulado en vez de empezar de cero cada vez.
//
// Devuelve data ESTRUCTURADA (no solo texto para el prompt) porque el informe
// también la muestra: es la pieza que demuestra que hay un sistema detrás.

import { leerDelOS } from "./bushido-os";
import { normalizarCategoria } from "./analisis";

interface RespuestaOS {
  ok: boolean;
  conocida: boolean;
  categoria?: string;
  marcas_analizadas?: number;
  suficiente?: boolean;
  carencias_tipicas?: string[];
  emociones_del_sector?: string[];
  canales_desatendidos?: string[];
  oportunidades_repetidas?: string[];
  transferencias?: Array<{ palanca?: string; lectura?: string; sector?: string }>;
  advertencia?: string;
  mensaje?: string;
  categorias_conocidas?: string[];
}

/** Lo que sabemos del sector, ya limpio y listo para usar. */
export interface BriefingSector {
  categoria: string;
  marcas: number;
  /** false → la muestra es corta: no se puede afirmar "el sector hace X". */
  suficiente: boolean;
  carencias: string[];
  emociones: string[];
  canales: string[];
  oportunidades: string[];
  transferencias: Array<{ palanca?: string; lectura?: string; sector?: string }>;
  advertencia?: string;
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

async function pedir(categoria: string) {
  return leerDelOS<RespuestaOS>(
    `/api/sitio/briefing?categoria=${encodeURIComponent(aSlug(categoria))}`
  );
}

/**
 * Trae lo que el cerebro sabe del sector de esta marca.
 *
 * La categoría se deduce con `normalizarCategoria` sobre TODAS las pistas
 * disponibles (nombre, lo que pidió, su biografía de Instagram, sus textos).
 * Antes se mandaba el texto crudo convertido a slug y casi nunca coincidía:
 * "Panadería Luz" no es ninguna categoría, "Repostería" sí.
 */
export async function briefingDelSector(pistas: string): Promise<BriefingSector | null> {
  if (!pistas.trim()) return null;

  const categoria = normalizarCategoria(pistas);
  // "Otro" no es un sector: no hay nada que saber de él.
  const primera = await pedir(categoria === "Otro" ? pistas.slice(0, 60) : categoria);

  // Si el OS rechazó (llave mal, caído…), el análisis sigue sin su briefing:
  // vale más un diagnóstico sin data de sector que ninguno.
  if (!primera.ok) {
    console.warn(`[briefing] sin data del sector: ${primera.detalle || primera.error}`);
    return null;
  }
  let r = primera.data;

  // Segundo intento: ¿alguna categoría que el OS sí conoce aparece en las pistas?
  if (!r.conocida && r.categorias_conocidas?.length) {
    const texto = aSlug(pistas);
    const match = r.categorias_conocidas.find((c) => {
      const s = aSlug(c);
      return texto.includes(s) || s.split("-").some((p) => p.length > 4 && texto.includes(p));
    });
    if (match) {
      const segunda = await pedir(match);
      if (segunda.ok) r = segunda.data;
    }
  }

  if (!r.ok || !r.conocida) return null;

  return {
    categoria: r.categoria || categoria,
    marcas: r.marcas_analizadas ?? 0,
    // Ante la duda, tratamos la muestra como corta: es más barato ser prudente
    // que afirmarle a un prospecto un patrón que no sostenemos.
    suficiente: r.suficiente === true,
    carencias: r.carencias_tipicas ?? [],
    emociones: r.emociones_del_sector ?? [],
    canales: r.canales_desatendidos ?? [],
    oportunidades: r.oportunidades_repetidas ?? [],
    transferencias: (r.transferencias ?? []).filter((t) => t.lectura || t.palanca),
    advertencia: r.advertencia,
  };
}

/** Formatea el briefing como bloque de evidencia para el prompt. */
export function briefingParaPrompt(b: BriefingSector | null): string {
  if (!b) return "";

  const lista = (titulo: string, items: string[]) =>
    items.length ? `${titulo}: ${items.join(" · ")}` : "";

  return [
    `LO QUE YA SABEMOS DE ESTA CATEGORÍA (${b.categoria}, ${b.marcas} marcas analizadas por Bushido).`,
    "Es data propia acumulada: úsala para ir más profundo y para comparar a esta marca con su sector,",
    "NO para repetirla tal cual. Si algo de esta marca contradice el patrón, eso es lo interesante — dilo.",
    "",
    lista("Carencias que se repiten en el sector", b.carencias),
    lista("Emociones que mueven la compra aquí", b.emociones),
    lista("Canales que casi nadie atiende", b.canales),
    lista("Oportunidades que aparecen una y otra vez", b.oportunidades),
    b.transferencias.length
      ? "Palancas que funcionan en OTROS sectores y aquí casi nadie usa: " +
        b.transferencias
          .map((t) => [t.sector ? `(${t.sector})` : "", t.lectura || t.palanca].filter(Boolean).join(" "))
          .join(" · ")
      : "",
    b.advertencia ? `⚠️ ${b.advertencia}` : "",
    !b.suficiente
      ? "⚠️ MUESTRA CORTA: no escribas «el sector hace X». Escribe «entre lo que hemos analizado…»."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
