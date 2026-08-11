"use client";

import { useState } from "react";

/**
 * Calculadora de pricing por criterios.
 *
 * La idea del documento de visión: no tener una tabla fija, sino criterios de
 * valoración — como trabajan las consultoras.
 *   Precio = Costo + Margen + Valor estratégico + Exclusividad
 *
 * Sirve para cotizar sabiendo cuánto queda para pagar equipo y cuánto para
 * Bushido, en vez de poner un número a ojo.
 */

interface Partida {
  id: string;
  concepto: string;
  valor: number;
  /** true = se paga a un aliado; false = costo fijo o de operación */
  equipo: boolean;
}

const BASE: Partida[] = [
  { id: "1", concepto: "Videógrafo (2 jornadas)", valor: 800_000, equipo: true },
  { id: "2", concepto: "Editor (10 reels)", valor: 700_000, equipo: true },
  { id: "3", concepto: "Video storytelling", valor: 300_000, equipo: true },
  { id: "4", concepto: "Edición de fotografías", valor: 200_000, equipo: true },
  { id: "5", concepto: "Diseño gráfico", valor: 500_000, equipo: true },
  { id: "6", concepto: "Project Manager", valor: 300_000, equipo: true },
  { id: "7", concepto: "Transporte", valor: 150_000, equipo: false },
  { id: "8", concepto: "Software", valor: 80_000, equipo: false },
];

const cop = (n: number) =>
  "$" + Math.round(n).toLocaleString("es-CO", { maximumFractionDigits: 0 });

export default function AdminPricing() {
  const [partidas, setPartidas] = useState<Partida[]>(BASE);
  const [margen, setMargen] = useState(40);
  const [estrategico, setEstrategico] = useState(0);
  const [nichoNuevo, setNichoNuevo] = useState(0);
  const [exclusividad, setExclusividad] = useState(0);

  const costo = partidas.reduce((s, p) => s + (p.valor || 0), 0);
  const costoEquipo = partidas.filter((p) => p.equipo).reduce((s, p) => s + (p.valor || 0), 0);

  // Margen sobre el precio (no sobre el costo): así se cotiza de verdad.
  const conMargen = margen < 100 ? costo / (1 - margen / 100) : costo;
  const ajuste = 1 + (estrategico + exclusividad - nichoNuevo) / 100;
  const precio = conMargen * ajuste;
  const utilidad = precio - costo;
  const margenReal = precio > 0 ? (utilidad / precio) * 100 : 0;

  const editar = (id: string, campo: keyof Partida, v: string | number | boolean) =>
    setPartidas((ps) => ps.map((p) => (p.id === id ? { ...p, [campo]: v } : p)));

  const PLANES = [
    { nombre: "Insight", precio: 2_500_000 },
    { nombre: "Evolution", precio: 3_900_000 },
    { nombre: "Dominance", precio: 5_200_000 },
  ];

  return (
    <div className="pricing">
      <div className="pr-cols">
        {/* ── Costos ── */}
        <div className="pr-card">
          <h4>Lo que cuesta atender a este cliente</h4>
          <div className="pr-partidas">
            {partidas.map((p) => (
              <div className="pr-fila" key={p.id}>
                <input
                  className="pr-concepto"
                  value={p.concepto}
                  onChange={(e) => editar(p.id, "concepto", e.target.value)}
                />
                <input
                  className="pr-valor"
                  type="number"
                  step={10000}
                  value={p.valor}
                  onChange={(e) => editar(p.id, "valor", Number(e.target.value))}
                />
                <button
                  type="button"
                  className={"pr-tipo" + (p.equipo ? " on" : "")}
                  onClick={() => editar(p.id, "equipo", !p.equipo)}
                  title={p.equipo ? "Se le paga a un aliado" : "Costo de operación"}
                >
                  {p.equipo ? "equipo" : "operación"}
                </button>
                <button
                  type="button"
                  className="pr-quitar"
                  onClick={() => setPartidas((ps) => ps.filter((x) => x.id !== p.id))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="pr-agregar"
            onClick={() =>
              setPartidas((ps) => [
                ...ps,
                { id: String(Date.now()), concepto: "Nuevo concepto", valor: 0, equipo: true },
              ])
            }
          >
            + Agregar partida
          </button>
          <div className="pr-total">
            <span>Costo directo</span>
            <strong>{cop(costo)}</strong>
          </div>
          <div className="pr-sub">
            De eso, <b>{cop(costoEquipo)}</b> se va en pagarle al equipo.
          </div>
        </div>

        {/* ── Criterios ── */}
        <div className="pr-card">
          <h4>Criterios de valoración</h4>

          <label className="pr-crit">
            <span>
              Margen objetivo <em>{margen}%</em>
            </span>
            <input type="range" min={0} max={70} value={margen} onChange={(e) => setMargen(+e.target.value)} />
            <small>Lo que queda para Bushido después de pagar todo.</small>
          </label>

          <label className="pr-crit">
            <span>
              Valor estratégico <em>+{estrategico}%</em>
            </span>
            <input type="range" min={0} max={40} value={estrategico} onChange={(e) => setEstrategico(+e.target.value)} />
            <small>El cliente tiene músculo, urgencia o mucho que ganar con esto.</small>
          </label>

          <label className="pr-crit">
            <span>
              Nicho que queremos aprender <em>−{nichoNuevo}%</em>
            </span>
            <input type="range" min={0} max={30} value={nichoNuevo} onChange={(e) => setNichoNuevo(+e.target.value)} />
            <small>Bajas el precio a cambio de data de una categoría nueva.</small>
          </label>

          <label className="pr-crit">
            <span>
              Exclusividad en su categoría <em>+{exclusividad}%</em>
            </span>
            <input type="range" min={0} max={50} value={exclusividad} onChange={(e) => setExclusividad(+e.target.value)} />
            <small>Si pide que no trabajemos con su competencia, se paga.</small>
          </label>
        </div>
      </div>

      {/* ── Resultado ── */}
      <div className="pr-resultado">
        <div className="pr-precio">
          <span className="pr-label">Precio sugerido</span>
          <strong>{cop(precio)}</strong>
          <span className="pr-mes">/ mes</span>
        </div>
        <div className="pr-desglose">
          <div>
            <span>Costo</span>
            <b>{cop(costo)}</b>
          </div>
          <div>
            <span>Queda para Bushido</span>
            <b className={utilidad <= 0 ? "mal" : ""}>{cop(utilidad)}</b>
          </div>
          <div>
            <span>Margen real</span>
            <b className={margenReal < 25 ? "mal" : ""}>{margenReal.toFixed(0)}%</b>
          </div>
        </div>
      </div>

      {/* ── Comparación con los planes publicados ── */}
      <div className="pr-planes">
        <h4>Con esta estructura de costos, tus planes dan:</h4>
        {PLANES.map((p) => {
          const u = p.precio - costo;
          const m = (u / p.precio) * 100;
          return (
            <div className="pr-plan" key={p.nombre}>
              <span className="pp-nombre">{p.nombre}</span>
              <span className="pp-precio">{cop(p.precio)}</span>
              <span className={"pp-margen" + (m < 25 ? " mal" : m < 40 ? " medio" : " bien")}>
                {u >= 0 ? `deja ${cop(u)} · ${m.toFixed(0)}%` : `PIERDE ${cop(-u)}`}
              </span>
            </div>
          );
        })}
        <p className="pr-nota">
          Un plan por debajo del 25% de margen no aguanta un imprevisto: una regrabación,
          un cliente que se atrasa en el pago o una jornada extra te lo comen. Si un plan
          sale en rojo, o le quitas alcance o le subes el precio.
        </p>
      </div>
    </div>
  );
}
