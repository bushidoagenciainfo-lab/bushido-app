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
      <div className="inner">
        <div className="eyebrow">Agencia audiovisual · Bogotá · bushidoav.com</div>
        <h1>
          Donde lo análogo se vuelve <span className="italic">inolvidable</span>.
        </h1>
        <p className="sub">
          La tecnología es la herramienta. <em>La mirada es nuestra.</em>{" "}
          Criterio audiovisual para marcas y artistas.
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
