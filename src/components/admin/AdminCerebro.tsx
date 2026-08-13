"use client";

import { useState } from "react";

/** Respuesta de GET /api/sitio/inteligencia */
interface Dato {
  valor: string;
  veces: number;
  de: number;
  pct?: number;
  confiable: boolean;
}
interface Patron {
  categoria: string;
  marcas_analizadas: number;
  marcas?: string[];
  suficiente: boolean;
  carencias?: Dato[];
  fortalezas?: Dato[];
  oportunidades?: Dato[];
  emociones?: Dato[];
  canales_flojos?: Dato[];
  lectura?: string;
}
interface Inteligencia {
  resumen?: {
    analisis: number;
    leads: number;
    creadores: number;
    categorias: number;
    categorias_con_evidencia: number;
  };
  patrones?: Patron[];
  transferencias?: Array<{ palanca: string; tipo?: string; fuerte_en?: string[]; ausente_en?: string[]; lectura?: string }>;
  demanda?: Array<{ sector: string; leads: number; pide?: string[]; necesita?: string[]; brecha?: string; lectura?: string }>;
  creadores_por_reclutar?: Array<{ categoria: string; marcas_analizadas: number }>;
}

/** Lista de datos con su nivel de confianza. Lo poco confiable se ve apagado. */
function Datos({ items }: { items?: Dato[] }) {
  if (!items?.length) return <p className="cb-vacio">Sin datos todavía.</p>;
  return (
    <ul className="cb-datos">
      {items.map((d) => (
        <li key={d.valor} className={d.confiable ? "" : "flojo"}>
          <span className="cb-valor">{d.valor}</span>
          <span className="cb-veces">
            {d.veces}/{d.de}
            {!d.confiable && <em> · aún no concluyente</em>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Lo que el cerebro ya concluyó cruzando toda la data. */
export default function AdminCerebro() {
  const [datos, setDatos] = useState<Inteligencia | null>(null);
  const [estado, setEstado] = useState<"idle" | "cargando" | "listo" | "error">("idle");
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);

  async function cargar() {
    setEstado("cargando");
    setError("");
    try {
      const r = await fetch("/api/admin/os?que=inteligencia");
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.error || "No se pudo consultar.");
        setEstado("error");
        return;
      }
      setDatos(d.data as Inteligencia);
      setEstado("listo");
    } catch {
      setError("Error de red.");
      setEstado("error");
    }
  }

  if (estado === "idle") {
    return (
      <div className="cerebro">
        <p className="cb-intro">
          Lo que Bushido OS concluyó cruzando todos los análisis, los leads y el book.
          A diferencia de la vista por nicho de aquí abajo, esto compara entre categorías
          y detecta lo que funciona en un sector y nadie usa en otro.
        </p>
        <button type="button" className="sync-btn" onClick={cargar}>
          ⇩ Traer del cerebro
        </button>
      </div>
    );
  }

  if (estado === "cargando") return <p className="admin-empty">Consultando al cerebro…</p>;

  if (estado === "error") {
    return (
      <div className="cerebro">
        <p className="sync-error">{error}</p>
        <button type="button" className="sync-btn" onClick={cargar}>
          Reintentar
        </button>
      </div>
    );
  }

  const r = datos?.resumen;
  const patrones = datos?.patrones ?? [];

  return (
    <div className="cerebro">
      {r && (
        <div className="cb-resumen">
          {[
            ["Análisis", r.analisis],
            ["Leads", r.leads],
            ["Creadores", r.creadores],
            ["Categorías", r.categorias],
            ["Con evidencia", r.categorias_con_evidencia],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <strong>{v}</strong>
              <span>{k}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lo más valioso: palancas que cruzan sectores */}
      {datos?.transferencias?.length ? (
        <div className="cb-bloque destacado">
          <h4>Lo que funciona en un sector y nadie usa en otro</h4>
          {datos.transferencias.map((t, i) => (
            <div className="cb-transfer" key={i}>
              <strong>{t.palanca}</strong>
              <p>{t.lectura}</p>
              {(t.fuerte_en?.length || t.ausente_en?.length) && (
                <div className="cb-tags">
                  {t.fuerte_en?.map((c) => (
                    <span key={"f" + c} className="tag ok">
                      funciona en {c}
                    </span>
                  ))}
                  {t.ausente_en?.map((c) => (
                    <span key={"a" + c} className="tag falta">
                      ausente en {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Demanda vs necesidad */}
      {datos?.demanda?.length ? (
        <div className="cb-bloque">
          <h4>Lo que piden vs. lo que necesitan</h4>
          {datos.demanda.map((d) => (
            <div className="cb-demanda" key={d.sector}>
              <div className="cb-dem-head">
                <strong>{d.sector}</strong>
                <span>{d.leads} leads</span>
              </div>
              <p>{d.lectura || d.brecha}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Patrones por categoría */}
      <div className="cb-bloque">
        <h4>Patrones por categoría</h4>
        {patrones.length === 0 && <p className="cb-vacio">Todavía no hay suficientes análisis.</p>}
        {patrones.map((p) => (
          <div className={"cb-cat" + (p.suficiente ? "" : " corta")} key={p.categoria}>
            <button
              type="button"
              className="cb-cat-head"
              onClick={() => setAbierta(abierta === p.categoria ? null : p.categoria)}
            >
              <span className="cb-cat-nombre">{p.categoria}</span>
              <span className="cb-cat-n">
                {p.marcas_analizadas} marca{p.marcas_analizadas === 1 ? "" : "s"}
              </span>
              {!p.suficiente && <span className="cb-corta">muestra corta</span>}
              <span className="cb-toggle">{abierta === p.categoria ? "−" : "+"}</span>
            </button>

            {abierta === p.categoria && (
              <div className="cb-cat-body">
                {p.lectura && <p className="cb-lectura">{p.lectura}</p>}
                {!p.suficiente && (
                  <p className="cb-aviso">
                    Menos de 3 marcas en esta categoría: sirve para orientarse, no para
                    afirmarle nada a un cliente.
                  </p>
                )}
                <div className="cb-cols">
                  <div>
                    <h5>Les falta</h5>
                    <Datos items={p.carencias} />
                  </div>
                  <div>
                    <h5>Tienen resuelto</h5>
                    <Datos items={p.fortalezas} />
                  </div>
                  <div>
                    <h5>Emociones</h5>
                    <Datos items={p.emociones} />
                  </div>
                  <div>
                    <h5>Canales flojos</h5>
                    <Datos items={p.canales_flojos} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dónde falta gente en el book */}
      {datos?.creadores_por_reclutar?.length ? (
        <div className="cb-bloque">
          <h4>Nichos donde te faltan creadores</h4>
          <div className="cb-tags">
            {datos.creadores_por_reclutar.map((c) => (
              <span key={c.categoria} className="tag falta">
                {c.categoria} · {c.marcas_analizadas} marcas y nadie en el book
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <button type="button" className="sync-btn" onClick={cargar}>
        ⇩ Actualizar
      </button>
    </div>
  );
}
