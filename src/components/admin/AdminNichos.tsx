"use client";

import { useState } from "react";
import type { NichoIntel } from "@/lib/admin";

/**
 * Inteligencia por nicho: qué tienen resuelto y qué les falta a las marcas
 * que piden el análisis gratis, agrupado por categoría.
 */
export default function AdminNichos({ nichos }: { nichos: NichoIntel[] }) {
  const [activo, setActivo] = useState(nichos[0]?.categoria ?? "");

  if (!nichos.length) {
    return (
      <p className="admin-empty">
        Todavía no hay análisis para cruzar. Cada análisis gratis que generes desde un
        lead alimenta esta vista.
      </p>
    );
  }

  const n = nichos.find((x) => x.categoria === activo) ?? nichos[0];
  const maxTema = Math.max(
    1,
    ...n.temasFortaleza.map((t) => t.count),
    ...n.temasCarencia.map((t) => t.count)
  );

  return (
    <div className="nichos">
      {/* selector de nicho */}
      <div className="nichos-tabs">
        {nichos.map((x) => (
          <button
            key={x.categoria}
            type="button"
            className={"nicho-tab" + (x.categoria === n.categoria ? " on" : "")}
            onClick={() => setActivo(x.categoria)}
          >
            {x.categoria}
            <span>{x.total}</span>
          </button>
        ))}
      </div>

      <div className="nicho-marcas">
        <span className="nm-label">{n.total} marca{n.total === 1 ? "" : "s"} analizada{n.total === 1 ? "" : "s"}</span>
        {n.marcas.map((m, k) => (
          <span key={m + k} className="nm-chip">
            {m}
          </span>
        ))}
      </div>

      {n.total < 3 && (
        <p className="nicho-aviso">
          Con {n.total} análisis los patrones todavía no son concluyentes. A partir de 3 o 4
          marcas del mismo nicho la lectura se vuelve fiable.
        </p>
      )}

      {/* patrones: lo que se repite entre marcas distintas */}
      <div className="nicho-cols">
        <div className="nicho-card ok">
          <h4>Lo que suelen tener resuelto</h4>
          {n.temasFortaleza.length ? (
            <ul className="tema-list">
              {n.temasFortaleza.map((t) => (
                <li key={t.name}>
                  <span className="tema-n">{t.name}</span>
                  <span className="tema-track">
                    <span className="tema-fill ok" style={{ width: `${(t.count / maxTema) * 100}%` }} />
                  </span>
                  <span className="tema-c">{t.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Sin patrones repetidos todavía.</p>
          )}
        </div>

        <div className="nicho-card bad">
          <h4>Lo que casi siempre les falta</h4>
          {n.temasCarencia.length ? (
            <ul className="tema-list">
              {n.temasCarencia.map((t) => (
                <li key={t.name}>
                  <span className="tema-n">{t.name}</span>
                  <span className="tema-track">
                    <span className="tema-fill bad" style={{ width: `${(t.count / maxTema) * 100}%` }} />
                  </span>
                  <span className="tema-c">{t.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Sin patrones repetidos todavía.</p>
          )}
        </div>
      </div>

      <div className="nicho-cols">
        <div className="nicho-card">
          <h4>Emociones que mueven la compra</h4>
          {n.emociones.length ? (
            <div className="emo-chips">
              {n.emociones.map((e) => (
                <span key={e.name} className="emo-chip">
                  {e.name} <b>{e.count}</b>
                </span>
              ))}
            </div>
          ) : (
            <p className="admin-empty">Sin datos.</p>
          )}
        </div>

        <div className="nicho-card">
          <h4>Canales flojos · oportunidad de venta</h4>
          {n.canalesFlojos.length ? (
            <div className="emo-chips">
              {n.canalesFlojos.map((c) => (
                <span key={c.name} className="emo-chip warn">
                  {c.name} <b>{c.count}</b>
                </span>
              ))}
            </div>
          ) : (
            <p className="admin-empty">Sin datos.</p>
          )}
        </div>
      </div>

      {/* el detalle textual, por si quiere leer el diagnóstico crudo */}
      <details className="nicho-detalle">
        <summary>Ver el detalle marca por marca</summary>
        <div className="nicho-cols">
          <div className="nicho-card ok">
            <h4>Fortalezas</h4>
            <ul className="frase-list">
              {n.fortalezas.map((f, k) => (
                <li key={k}>
                  {f.texto} <em>· {f.marca}</em>
                </li>
              ))}
            </ul>
          </div>
          <div className="nicho-card bad">
            <h4>Carencias</h4>
            <ul className="frase-list">
              {n.carencias.map((f, k) => (
                <li key={k}>
                  {f.texto} <em>· {f.marca}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {n.oportunidades.length > 0 && (
          <div className="nicho-card" style={{ marginTop: 12 }}>
            <h4>Oportunidades detectadas</h4>
            <ul className="frase-list">
              {n.oportunidades.map((f, k) => (
                <li key={k}>
                  {f.texto} <em>· {f.marca}</em>
                </li>
              ))}
            </ul>
          </div>
        )}
      </details>
    </div>
  );
}
