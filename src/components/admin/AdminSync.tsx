"use client";

import { useState } from "react";

interface Bloque {
  enviados?: number;
  ok?: boolean;
  error?: string;
  /** Lo que respondió el OS: guardados, descartados, aviso… */
  data?: {
    guardados?: number;
    descartados?: number;
    aviso?: string;
  };
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
  const [destino, setDestino] = useState("");
  const [pista, setPista] = useState("");

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
      setDestino(d.destino || "");
      setPista(d.pista ? `${d.pista}\nHuella de tu clave: ${d.secreto}` : "");
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
      {destino && (
        <p className="sync-destino">
          Enviando a <code>{destino}</code>
        </p>
      )}
      {pista && <p className="sync-pista">{pista}</p>}

      {Object.keys(reporte).length > 0 && (
        <div className="sync-reporte">
          {Object.entries(reporte).map(([clave, b]) => {
            const d = b.data;
            const descartados = d?.descartados ?? 0;
            return (
              <div
                className={
                  "sync-fila" + (b.ok === false ? " mal" : descartados > 0 ? " aviso" : " bien")
                }
                key={clave}
              >
                <span className="sf-nombre">{NOMBRES[clave] ?? clave}</span>
                <span className="sf-dato">
                  {b.ok === false
                    ? b.error || "falló"
                    : `${d?.guardados ?? b.enviados ?? 0} guardados`}
                  {/* Si algo no entró hay que verlo AHORA, no dentro de un mes */}
                  {descartados > 0 && (
                    <em className="sf-descartados">
                      {descartados} descartado{descartados === 1 ? "" : "s"}
                      {d?.aviso ? ` · ${d.aviso}` : " · les faltaba id o el campo obligatorio"}
                    </em>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
