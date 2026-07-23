// Tipos/constantes del admin SIN dependencias de servidor (node:fs, supabase).
// Se puede importar tanto desde componentes cliente como desde el servidor.
import type { LeadInput } from "./leads"; // import type → se borra en compilación

export const LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "propuesta",
  "ganado",
  "perdido",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadRow extends LeadInput {
  id: string;
  created_at: string;
  status: string;
}
