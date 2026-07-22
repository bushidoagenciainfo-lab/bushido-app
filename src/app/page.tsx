import Link from "next/link";
import Hero from "@/components/Hero";
import PortfolioDeck from "@/components/PortfolioDeck";
import AnalisisButton from "@/components/AnalisisButton";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        <section id="portafolio" style={{ paddingBottom: 20 }}>
          <div className="section-head">
            <div>
              <div className="section-num">Trabajo</div>
            </div>
            <div className="head-stack">
              <h2 className="section-title">
                Fragmentos de <em>lo que hicimos</em>.
              </h2>
              <p className="section-note">
                Videoclips, campañas, cubrimiento en vivo y editorial. El showreel
                completo se comparte con clientes que dejan sus datos.
              </p>
            </div>
          </div>
        </section>

        <PortfolioDeck />

        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 90px" }}>
          <Link href="/portafolio" className="btn btn-ghost">
            Ver todo el portafolio <span className="arrow">→</span>
          </Link>
        </div>

        <section className="contact">
          <div className="contact-inner">
            <h2>
              ¿Analizamos tus redes <em>gratis</em>?
            </h2>
            <p className="contact-sub">
              Un diagnóstico con las oportunidades reales de tu marca, en menos de
              24 horas. Sin compromiso.
            </p>
            <div className="contact-actions">
              <AnalisisButton className="btn btn-primary">
                Quiero mi análisis <span className="arrow">→</span>
              </AnalisisButton>
              <Link href="/servicios" className="btn btn-ghost">
                Ver servicios <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
