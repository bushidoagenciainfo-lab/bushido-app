export const ANALISIS_EVENT = "bushido:analisis";

export function openAnalisis() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ANALISIS_EVENT));
  }
}
