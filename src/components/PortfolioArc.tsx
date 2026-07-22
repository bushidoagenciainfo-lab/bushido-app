"use client";

import { useEffect, useRef } from "react";
import { PORTFOLIO } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";

const SPACING = 15; // grados entre piezas
const RADIUS = 440;
const N = PORTFOLIO.length;

function place(theta: number) {
  const rad = (theta * Math.PI) / 180;
  const x = RADIUS * Math.sin(rad);
  const y = RADIUS * (1 - Math.cos(rad));
  const abs = Math.abs(theta);
  const scale = Math.max(0.55, 1 - abs / 150);
  const opacity = abs > 92 ? 0 : Math.max(0.12, 1 - abs / 95);
  return {
    transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex: Math.round(300 - abs),
    focus: abs < SPACING / 2,
  };
}
const baseTheta = (i: number) => (i - (N - 1) / 2) * SPACING;

export default function PortfolioArc() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const offset = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const maxOffset = ((N - 1) * SPACING) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      target.current = -nx * (2 * maxOffset);
    };
    wrap.addEventListener("mousemove", onMove);

    const apply = () => {
      const off = offset.current;
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const s = place(baseTheta(i) + off);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.zIndex = String(s.zIndex);
        el.style.pointerEvents = s.opacity < 0.25 ? "none" : "auto";
        el.classList.toggle("focus", s.focus);
      }
    };
    const loop = () => {
      offset.current += (target.current - offset.current) * (reduce ? 1 : 0.09);
      apply();
      raf.current = requestAnimationFrame(loop);
    };
    apply(); // posición inicial inmediata
    raf.current = requestAnimationFrame(loop);

    return () => {
      wrap.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* DESKTOP: arco scrub */}
      <div className="arc-wrap" ref={wrapRef}>
        <div className="arc-stage">
          {PORTFOLIO.map((p, i) => {
            const s0 = place(baseTheta(i));
            return (
              <button
                key={p.file}
                type="button"
                className={"arc-card" + (s0.focus ? " focus" : "")}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{ transform: s0.transform, opacity: s0.opacity, zIndex: s0.zIndex }}
                onClick={openAnalisis}
                aria-label={p.title}
              >
                <div className="a-img" style={{ backgroundImage: `url('/portafolio/${p.file}.jpg')` }} />
                <div className="a-scrim" />
                <div className="a-lock">Privado</div>
                <div className="a-body">
                  <div className="a-cat">{p.label}</div>
                  <div className="a-title">{p.title}</div>
                  <div className="a-client">{p.client}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="arc-hint" aria-hidden="true">
        <span className="dash" /> Mueve el cursor para pasar las piezas <span className="dash" />
      </div>

      {/* MÓVIL: fila con scroll */}
      <div className="arc-mobile">
        {PORTFOLIO.map((p) => (
          <button key={p.file} type="button" className="am-card" onClick={openAnalisis} aria-label={p.title}>
            <div className="a-img" style={{ backgroundImage: `url('/portafolio/${p.file}.jpg')` }} />
            <div className="a-scrim" />
            <div className="a-body">
              <div className="a-cat">{p.label}</div>
              <div className="a-title">{p.title}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
