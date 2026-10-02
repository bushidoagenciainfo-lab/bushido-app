import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import NoPopup from "@/components/NoPopup";
import { waUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Página no encontrada · Bushido",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <NoPopup />
      <main className="nf">
        <div className="nf-inner">
          <div className="nf-num">404</div>
          <h1>
            Esta toma <em>no existe</em>.
          </h1>
          <p>
            La página que buscas se movió o nunca estuvo aquí. Lo que sí está:
            el trabajo, los servicios con precio y una forma directa de hablar.
          </p>
          <div className="nf-actions">
            <Link href="/portafolio" className="btn btn-primary">
              Ver el portafolio <span className="arrow">→</span>
            </Link>
            <Link href="/servicios" className="btn btn-ghost">
              Servicios y precios <span className="arrow">→</span>
            </Link>
            <a
              href={waUrl("Hola Bushido, llegué a una página que no existe y quiero hablar de un proyecto.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Escribir por WhatsApp <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
