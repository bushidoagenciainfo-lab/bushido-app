import type { Metadata } from "next";
import PortfolioArc from "@/components/PortfolioArc";
import PortfolioGrid from "@/components/PortfolioGrid";
import AnalisisButton from "@/components/AnalisisButton";
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
                Esto ya <em>pasó</em>.
              </h1>
            </div>
            <p>
              Escenarios de talla mundial, campañas para Adidas y Nike, y contenido
              que la gente compartió sola. Abre cualquier proyecto y míralo completo.
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

        <section>
          <div className="price-cta">
            <div className="price-cta-text">
              ¿Quieres ver el showreel <em>completo</em>?
              <br />
              Está reservado para clientes que dejan sus datos.
            </div>
            <AnalisisButton className="btn btn-primary">
              Pedir acceso <span className="arrow">→</span>
            </AnalisisButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
