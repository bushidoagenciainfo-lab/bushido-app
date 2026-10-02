import Link from "next/link";
import AnalisisButton from "./AnalisisButton";
import HeroVideo from "./HeroVideo";
import { HERO_PROOF } from "@/lib/site";

// ── Fondo del hero (un solo interruptor manda) ────────────────────────
// "gradient" = degradado cinematográfico (provisional, sin imagen).
// "still"    = fotograma fijo (STILL). Pon la foto nueva en public/hero/still.jpg (1920 px).
// "video"    = video a pantalla completa (public/hero/hero.mp4).
const HERO_BG: "gradient" | "still" | "video" = "gradient";
const STILL = "/hero/still.jpg";

export default function Hero() {
  const proofHref = HERO_PROOF.url || "/portafolio";
  const proofExterno = Boolean(HERO_PROOF.url);
  return (
    <section className={"hero-v2 hero-vid" + (HERO_BG === "gradient" ? " hero-vid--flat" : "")} id="top">
      <div className="hero-vid-bg" aria-hidden="true">
        {HERO_BG === "video" ? (
          <HeroVideo />
        ) : HERO_BG === "still" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-still" src={STILL} alt="" fetchPriority="high" decoding="async" />
        ) : (
          <div className="hero-vid-gradient" />
        )}
        <div className="hero-vid-overlay" />
        <div className="hero-vid-grain" />
      </div>

      <div className="inner">
        <div className="eyebrow">Agencia audiovisual · Bogotá · bushidoav.com</div>
        <h1>
          Hacemos lo que la gente <span className="italic">recuerda</span>.
        </h1>
        <p className="sub">
          Cualquiera produce contenido. Lo difícil es saber{" "}
          <em>cuál vale la pena producir</em>. Investigamos antes de encender la
          cámara — y cada pieza nos enseña algo para la siguiente.
        </p>
        {/* La línea concreta: QUÉ hacemos y PARA QUIÉN (el lema de arriba es la voz, esto es la promesa) */}
        <p className="hero-claim">
          Video, foto y contenido para marcas y artistas que necesitan vender, no solo publicar
        </p>
        <div className="actions">
          <Link href="/contacto#form" className="btn btn-primary">
            Cotizar mi proyecto <span className="arrow">→</span>
          </Link>
          <AnalisisButton className="btn btn-ghost liquid-glass">
            Análisis gratis <span className="arrow">→</span>
          </AnalisisButton>
        </div>

        {/* Prueba social: números reales de una sola pieza orgánica. Enlaza a la pieza. */}
        <a
          className="hero-proof liquid-glass"
          href={proofHref}
          target={proofExterno ? "_blank" : undefined}
          rel={proofExterno ? "noopener noreferrer" : undefined}
          aria-label="Ver la pieza que logró estos resultados"
        >
          <div className="proof-item">
            <span className="proof-n">43,4M</span>
            <span className="proof-l">vistas orgánicas</span>
          </div>
          <span className="proof-sep" aria-hidden="true" />
          <div className="proof-item">
            <span className="proof-n">2,7M</span>
            <span className="proof-l">cuentas alcanzadas</span>
          </div>
          <span className="proof-sep" aria-hidden="true" />
          <div className="proof-item">
            <span className="proof-n">1,7M</span>
            <span className="proof-l">me gusta</span>
          </div>
          <span className="proof-note">
            con una sola pieza · sin pauta
            <span className="arrow">{proofExterno ? "ver la pieza ↗" : "ver el trabajo →"}</span>
          </span>
        </a>
      </div>

      <div className="scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
