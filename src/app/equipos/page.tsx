import type { Metadata } from "next";
import EquiposCatalog from "@/components/EquiposCatalog";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Alquiler de equipos · Bushido", description: "Renta de cámaras, lentes, luces, audio y grip en Bogotá. Catálogo de equipos audiovisuales profesionales con solicitud directa." };

export default function EquiposPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">Gremio · Equipos</div>
              <h1>
                Alquiler de <em>equipo</em>.
              </h1>
            </div>
            <p>
              Cámaras, ópticas, luces, monitores, grip y más. Arma tu lista y
              envíala — coordinamos disponibilidad y valores por WhatsApp.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 50 }}>
          <EquiposCatalog />
        </section>
      </main>
      <Footer />
    </>
  );
}
