import Link from "next/link";
import AnalisisButton from "./AnalisisButton";
import HeroVideo from "./HeroVideo";

// ── Interruptor del fondo del hero ──────────────────────────────────
// false = degradado cinematográfico (provisional, para presentar hoy).
// true  = video a pantalla completa (public/hero/hero.mp4).
// Cuando Maick tenga el clip definitivo: pon USE_VIDEO en true y reemplaza el .mp4.
const USE_VIDEO = false;

export default function Hero() {
  return (
    <section className={"hero-v2 hero-vid" + (USE_VIDEO ? "" : " hero-vid--flat")} id="top">
      <div className="hero-vid-bg" aria-hidden="true">
        {USE_VIDEO ? <HeroVideo /> : <div className="hero-vid-gradient" />}
        <div className="hero-vid-overlay" />
        <div className="hero-vid-grain" />
      </div>

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
          <Link href="/portafolio" className="btn btn-ghost liquid-glass">
            Ver el portafolio <span className="arrow">→</span>
          </Link>
        </div>
      </div>

      <div className="scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
