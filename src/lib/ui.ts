import { track } from "./track";

export const ANALISIS_EVENT = "bushido:analisis";

// origen es `unknown` para que sirva directo como onClick (recibe el MouseEvent
// sin romper tipos); solo lo usamos si de verdad nos pasan un string.
export function openAnalisis(origen?: unknown) {
  if (typeof window !== "undefined") {
    const o = typeof origen === "string" ? origen : undefined;
    track("cta", "analisis", o ? { origen: o } : undefined);
    window.dispatchEvent(new CustomEvent(ANALISIS_EVENT));
  }
}
