"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import AnalisisButton from "./AnalisisButton";

const HeroCanvas = dynamic(() => import("./hero/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  return (
    <section className="hero-v2" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <HeroCanvas />
      <div className="hero-veil" aria-hidden="true" />
      <div className="inner">
        <div className="eyebrow">Agencia audiovisual · Bogotá · bushidoav.com</div>
        <h1>
          Hacemos lo que la gente <span className="italic">recuerda</span>.
        </h1>
        <p className="sub">
          No vendemos horas de cámara. Construimos <em>criterio visual</em> para
          artistas, marcas y compañías que necesitan contenido que funcione — y
          que se quede.
        </p>
        <div className="actions">
          <AnalisisButton className="btn btn-primary">
            Pide tu análisis <span className="arrow">→</span>
          </AnalisisButton>
          <Link href="/portafolio" className="btn btn-ghost">
            Ver el portafolio <span className="arrow">→</span>
          </Link>
        </div>
        <div className="mode-caption" aria-hidden="true">
          <span>Análogo</span>
          <span className="mc-arrows">⇄</span>
          <span>Digital</span>
          <span className="mc-hint">mueve el cursor</span>
        </div>
      </div>
      <div className="scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
