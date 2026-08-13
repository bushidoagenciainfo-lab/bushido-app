"use client";

import { useState } from "react";

interface Bloque {
  enviados?: number;
  ok?: boolean;
  error?: string;
}

const NOMBRES: Record<string, string> = {
  creadores: "Book de creadores",
  analisis: "Análisis de marcas",
  nichos: "Inteligencia por nicho",
  leads: "Leads recibidos",
};

/** Manda al cerebro toda la data acumulada para que la cruce entre nichos. */
export default function AdminSync() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");
  const [reporte, setReporte] = useState<Record<string, Bloque>>({});
  const [error, setError] = useState("");

  async function sincronizar() {
    setEstado("enviando");
    setError("");
    setReporte({});
    try {
      const res = await fetch("/api/admin/sincronizar", { method: "POST" });
      const d = await res.json();
      if (!res.ok || !d.reporte) {
        setError(d.error || "No se pudo sincronizar.");
        setEstado("error");
        return;
      }
      setReporte(d.reporte);
      setEstado(d.ok ? "listo" : "error");
      if (!d.ok) setError("Algunos bloques no llegaron. Mira el detalle.");
    } catch {
      setError("Error de red.");
      setEstado("error");
    }
  }

  return (
    <div className="sync">
      <p className="sync-intro">
        El sitio capta; el cerebro analiza. Esto le manda todo lo acumulado —el book, los
        análisis, los patrones por nicho y los leads— para que lo cruce con lo que ya sabe
        de otras categorías.
      </p>

      <button
        type="button"
        className="sync-btn"
        onClick={sincronizar}
        disabled={estado === "enviando"}
      >
        {estado === "enviando" ? "Enviando al cerebro…" : "⇪ Sincronizar con Bushido OS"}
      </button>

      {error && <p className="sync-error">{error}</p>}

      {Object.keys(reporte).length > 0 && (
        <div className="sync-reporte">
          {Object.entries(reporte).map(([clave, b]) => (
            <div className={"sync-fila" + (b.ok === false ? " mal" : " bien")} key={clave}>
              <span className="sf-nombre">{NOMBRES[clave] ?? clave}</span>
              <span className="sf-dato">
                {b.ok === false ? b.error || "falló" : `${b.enviados ?? 0} enviados`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
