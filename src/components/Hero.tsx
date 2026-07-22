import Link from "next/link";
import AnalisisButton from "./AnalisisButton";

export default function Hero() {
  return (
    <section className="hero-split" id="top">
      <div className="hero-left">
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
      </div>

      <div className="crt-stage" aria-hidden="true">
        <div className="crt">
          <div className="crt-body" />
          <div className="crt-screen">
            <div className="crt-glow" />
            <div className="crt-word">BUSHIDO</div>
            <div className="crt-bar" />
            <div className="crt-scan" />
            <div className="crt-vignette" />
          </div>
          <div className="crt-led" />
          <div className="crt-foot" />
          <div className="crt-tag">
            Análogo <em>⇄</em> Digital
          </div>
        </div>
      </div>
    </section>
  );
}
