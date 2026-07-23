"use client";

import { useState } from "react";
import type { EmocionDetalle } from "@/lib/analisis";

/**
 * Emociones interactivas del informe: cada pill se puede clickear y abajo
 * aparece el argumento de por qué esa emoción mueve la compra en la marca.
 */
export default function Emociones({ detalle }: { detalle: EmocionDetalle[] }) {
  const [sel, setSel] = useState(0);
  if (!detalle?.length) return null;
  const activa = detalle[sel] ?? detalle[0];

  return (
    <div className="rep-emos-wrap">
      <div className="rep-emos">
        {detalle.map((e, i) => (
          <button
            key={e.emocion}
            type="button"
            className={"emo" + (i === sel ? " on" : "")}
            onClick={() => setSel(i)}
            aria-pressed={i === sel}
          >
            {e.emocion}
          </button>
        ))}
      </div>
      <div className="emo-panel" key={activa.emocion}>
        <span className="emo-panel-tag">{activa.emocion}</span>
        <p>{activa.porque}</p>
      </div>
      <p className="emo-hint">Toca cada emoción para ver por qué mueve la compra.</p>
    </div>
  );
}
