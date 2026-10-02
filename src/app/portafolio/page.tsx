import type { Metadata } from "next";
import PortfolioArc from "@/components/PortfolioArc";
import PortfolioGrid from "@/components/PortfolioGrid";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Portafolio · Bushido", description: "Trabajos de Bushido con artistas y marcas: música, moda y contenido. Producción audiovisual con criterio cinematográfico." };

export default function PortafolioPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">01 · Portafolio</div>
              <h1>
                Esto ya se <em>hizo</em>.
              </h1>
            </div>
            <p>
              Producción audiovisual con criterio cinematográfico para marcas y
              artistas. Cada proyecto tiene su dirección, su estrategia y su
              resultado. Abre cualquiera y míralo completo.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 40, paddingBottom: 20 }}>
          <PortfolioArc />
        </section>

        <section style={{ paddingTop: 0 }}>
          <div className="filter-lead">
            <span className="fl-num">Explora</span>
            <h2>Por <em>categoría</em>.</h2>
          </div>
          <PortfolioGrid />
        </section>

      </main>
      <Footer />
    </>
  );
}
