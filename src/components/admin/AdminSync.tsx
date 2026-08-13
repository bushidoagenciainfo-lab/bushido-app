"use client";

import { useState } from "react";

interface Bloque {
  enviados?: number;
  ok?: boolean;
  error?: string;
  /** Lo que respondió el OS: guardados, descartados, aviso… */
  motivo?: string;
  detalle?: string;
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
      setPista(d.pista || "");
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

      <Normalizar />
    </div>
  );
}

interface Reparto {
  categoria: string;
  marcas: number;
  hacePatron: boolean;
}
interface Cambio {
  marca: string;
  de: string;
  a: string;
}

/**
 * Colapsa las categorías duplicadas. Primero enseña qué cambiaría; solo
 * después toca la base. Sin esto, "Fotografía" y "Fotografía profesional"
 * cuentan como sectores distintos y ningún patrón llega a 3 marcas.
 */
function Normalizar() {
  const [estado, setEstado] = useState<"idle" | "viendo" | "listo" | "error">("idle");
  const [datos, setDatos] = useState<{
    analisis?: number;
    categorias_antes?: number;
    categorias_despues?: number;
    con_patron?: number;
    aplicado?: boolean;
    cambios?: Cambio[];
    reparto?: Reparto[];
    error?: string;
  }>({});

  async function pedir(aplicar: boolean) {
    setEstado("viendo");
    try {
      const r = await fetch("/api/admin/normalizar-categorias", {
        method: aplicar ? "POST" : "GET",
      });
      const d = await r.json();
      setDatos(d);
      setEstado(d.ok ? "listo" : "error");
    } catch {
      setDatos({ error: "Error de red." });
      setEstado("error");
    }
  }

  return (
    <div className="norm">
      <h4>Categorías de los análisis</h4>
      <p className="norm-intro">
        El cerebro agrupa por texto exacto. Si la misma categoría está escrita de dos
        formas, la evidencia se parte en dos y ningún patrón llega a las 3 marcas que
        hacen falta. Esto las colapsa a la lista cerrada.
      </p>

      <div className="norm-btns">
        <button type="button" className="sync-btn ghost" onClick={() => pedir(false)}>
          Ver qué cambiaría
        </button>
        {estado === "listo" && !datos.aplicado && (datos.cambios?.length ?? 0) > 0 && (
          <button type="button" className="sync-btn" onClick={() => pedir(true)}>
            Aplicar {datos.cambios?.length} cambios
          </button>
        )}
      </div>

      {estado === "viendo" && <p className="admin-empty">Revisando…</p>}
      {estado === "error" && <p className="sync-error">{datos.error}</p>}

      {estado === "listo" && (
        <>
          <p className="norm-resumen">
            {datos.analisis} análisis · <strong>{datos.categorias_antes}</strong> categorías
            distintas → <strong>{datos.categorias_despues}</strong> tras colapsar ·{" "}
            <b>{datos.con_patron}</b> ya con 3 o más marcas
            {datos.aplicado && " · guardado ✓"}
          </p>

          {datos.reparto?.length ? (
            <div className="norm-reparto">
              {datos.reparto.map((c) => (
                <span key={c.categoria} className={"norm-cat" + (c.hacePatron ? " ok" : "")}>
                  {c.categoria} <b>{c.marcas}</b>
                </span>
              ))}
            </div>
          ) : null}

          {datos.cambios?.length ? (
            <details className="norm-detalle">
              <summary>
                {datos.aplicado ? "Se cambiaron" : "Cambiarían"} {datos.cambios.length}
              </summary>
              <ul>
                {datos.cambios.map((c, i) => (
                  <li key={i}>
                    <strong>{c.marca}</strong>
                    <span>
                      {c.de} → <em>{c.a}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="norm-ok">Todas las categorías ya están normalizadas.</p>
          )}

          {datos.aplicado && (
            <p className="norm-siguiente">
              Ahora vuelve a sincronizar para que el cerebro las reciba unificadas.
            </p>
          )}
        </>
      )}
    </div>
  );
}
