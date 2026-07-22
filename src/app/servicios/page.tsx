import type { Metadata } from "next";
import ServicesRadial from "@/components/ServicesRadial";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Servicios y precios · Bushido" };

export default function ServiciosPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">02 · Servicios</div>
              <h1>
                Servicios y <em>precios</em>.
              </h1>
            </div>
            <p>
              Elige un servicio para ver sus paquetes, precios y lo que incluye.
              Precios base en COP — cada proyecto se afina en una conversación.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 40 }}>
          <ServicesRadial />
        </section>
      </main>
      <Footer />
    </>
  );
}
