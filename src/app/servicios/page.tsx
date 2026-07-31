import type { Metadata } from "next";
import ServiceList from "@/components/ServiceList";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Servicios y precios · Bushido", description: "Paquetes de redes, videoclips, comerciales, cobertura de eventos y fotografía. Precios claros y propuesta a la medida en 24 horas." };

export default function ServiciosPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">02 · Servicios</div>
              <h1>
                Lo que <em>armamos</em> para ti.
              </h1>
            </div>
            <p>
              Abre una categoría, elige el servicio y mira exactamente qué incluye y
              cuánto cuesta. Sin cotizaciones misteriosas: precios base en COP y
              todo se afina contigo.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 60 }}>
          <ServiceList />
        </section>
      </main>
      <Footer />
    </>
  );
}
