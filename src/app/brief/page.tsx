import type { Metadata } from "next";
import BriefForm from "@/components/BriefForm";
import Footer from "@/components/Footer";

// Página pública pero fuera de la navegación: el link se comparte con el
// cliente cuando ya cerró contrato. No queremos que salga en buscadores.
export const metadata: Metadata = {
  title: "Brief de marca · Bushido",
  description: "Formulario de onboarding para clientes de Bushido.",
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">Onboarding · Brief de marca</div>
              <h1>
                Antes de la <em>cámara</em>.
              </h1>
            </div>
            <p>
              Antes de crear contenido, necesitamos entender tu marca desde adentro.
              Este brief nos da la información clave para diseñar una estrategia que
              funcione para tu negocio.
            </p>
          </div>
        </div>

        <section className="brief-page">
          <div className="brief-aviso">
            <span className="ba-tag">Tómate 15 minutos</span>
            <p>
              Complétalo con calma. No hay respuestas incorrectas — lo que nos interesa
              es tu perspectiva real, no la versión bonita. Mientras más honesto seas,
              mejor estrategia podemos construir.
            </p>
          </div>

          <BriefForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
