"use client";

import { useEffect, useRef, useState } from "react";
import AnalisisButton from "./AnalisisButton";

// 4 pasos visibles, cada uno cerrado con lo que GANA el cliente.
const PASOS = [
  ["01", "Analizamos", "Tu marca, tu competencia y cómo se comporta tu audiencia de verdad.", "Sabes qué está saturado y dónde hay espacio."],
  ["02", "Decidimos", "Hipótesis concreta, concepto, guion y formato salen de la evidencia.", "Inviertes solo en lo que vale la pena producir."],
  ["03", "Producimos", "Aquí entra la cámara. Recién aquí.", "Piezas con dirección, no contenido de relleno."],
  ["04", "Medimos y aprendemos", "Retención, guardados, alcance nuevo. Lo que indica compra.", "Cada ciclo arranca sabiendo más que el anterior."],
] as const;

// El proceso completo (8 pasos), plegado.
const DETALLE = [
  ["01", "Analizamos", "Tu marca, tu competencia y cómo se comporta tu audiencia de verdad."],
  ["02", "Detectamos", "Qué está saturado, qué nadie está haciendo, dónde hay espacio."],
  ["03", "Construimos hipótesis", "Una apuesta concreta, no una corazonada."],
  ["04", "Diseñamos la narrativa", "Concepto, guion y formato salen de la evidencia."],
  ["05", "Producimos", "Aquí entra la cámara. Recién aquí."],
  ["06", "Medimos", "Retención, guardados, alcance nuevo. Lo que indica compra."],
  ["07", "Aprendemos", "Qué funcionó y por qué. Eso entra a tu tablero."],
  ["08", "Volvemos a empezar", "Cada ciclo arranca sabiendo más que el anterior."],
] as const;

export default function Metodo() {
  const [detalle, setDetalle] = useState(false);
  const listRef = useRef<HTMLOListElement | null>(null);

  // Entrada escalonada (60 ms entre pasos) cuando la lista entra al viewport.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll("li"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((li) => li.classList.add("in"));
      return;
    }
    let hecho = false;
    const entrar = () => {
      if (hecho) return;
      hecho = true;
      items.forEach((li, i) => window.setTimeout(() => li.classList.add("in"), i * 60));
      io.disconnect();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) entrar();
      },
      { threshold: 0.15 }
    );
    io.observe(list);
    // Red de seguridad: si el observer no dispara (pestaña oculta, navegador raro),
    // los pasos aparecen igual pasados 2,5 s. Nunca se queda la sección en blanco.
    const t = window.setTimeout(entrar, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <section className="metodo">
      <div className="metodo-head">
        <div className="section-num">El sistema</div>
        <h2>
          Producir es lo último que <em>hacemos</em>.
        </h2>
        <p>
          Lo valioso no es producir videos: es saber cuáles vale la pena producir.
          Así trabajamos cada proyecto, del primero al último.
        </p>
      </div>

      <ol className="metodo-pasos m4" ref={listRef}>
        {PASOS.map(([n, titulo, texto, gana]) => (
          <li key={n} className="rv">
            <span className="mp-num">{n}</span>
            <div>
              <strong>{titulo}</strong>
              <span>{texto}</span>
              <span className="mp-gana">
                <b>Tú ganas</b>
                {gana}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <button type="button" className="metodo-more" onClick={() => setDetalle((d) => !d)} aria-expanded={detalle}>
        {detalle ? "Ocultar el proceso completo −" : "Ver el proceso completo · 8 pasos +"}
      </button>

      {detalle && (
        <div className="metodo-detalle">
          <ol className="metodo-pasos">
            {DETALLE.map(([n, titulo, texto]) => (
              <li key={n} className="in">
                <span className="mp-num">{n}</span>
                <div>
                  <strong>{titulo}</strong>
                  <span>{texto}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="metodo-cierre">
        Por eso cada cliente nuevo hace al sistema más inteligente — y esa
        inteligencia trabaja para todos los demás.
      </p>

      <div className="metodo-cta">
        <AnalisisButton className="btn btn-primary">
          Empieza por el paso 01 · análisis gratis <span className="arrow">→</span>
        </AnalisisButton>
      </div>
    </section>
  );
}
