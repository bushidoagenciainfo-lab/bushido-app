import type { Metadata } from "next";
import Link from "next/link";
import GremioForm from "@/components/GremioForm";
import AnalisisButton from "@/components/AnalisisButton";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Gremio · Bushido", description: "Únete al gremio Bushido: banco de talentos audiovisuales, alquiler de equipos y recursos para creadores en Colombia." };

export default function GremioPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">03 · Gremio</div>
              <h1>
                El <em>gremio</em> Bushido.
              </h1>
            </div>
            <p>
              No solo hacemos proyectos — construimos comunidad. Equipos,
              formación, talento y herramientas para quienes crean en Colombia.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 60 }}>
          <div className="gremio-grid">
            <article className="gremio-card">
              <div className="gremio-num">01 / Equipos</div>
              <h3>
                Alquiler de <em>equipo</em>
              </h3>
              <p>
                Cámaras, ópticas, luces, audio y grip con respaldo profesional. Te
                asesoramos qué necesitas de verdad.
              </p>
              <ul className="gremio-list">
                <li>Cámaras cine</li>
                <li>Ópticas</li>
                <li>Iluminación</li>
                <li>Audio</li>
                <li>Grip</li>
              </ul>
              <Link href="/equipos" className="btn btn-ghost">
                Ver catálogo <span className="arrow">→</span>
              </Link>
            </article>

            <article className="gremio-card">
              <div className="gremio-num">02 / Educación</div>
              <h3>
                Cursos y <em>talleres</em>
              </h3>
              <p>
                Formación práctica en producción, foto, edición y color. Lo que
                aprendimos en el set, ordenado para que arranques más rápido.
              </p>
              <ul className="gremio-list">
                <li>Producción</li>
                <li>Fotografía</li>
                <li>Edición</li>
                <li>Color</li>
              </ul>
              <span className="btn btn-ghost" style={{ opacity: 0.7, cursor: "default" }}>
                Próximamente
              </span>
            </article>

            <article className="gremio-card">
              <div className="gremio-num">03 / Talento y aliados</div>
              <h3>
                Creators y <em>crew</em>
              </h3>
              <p>
                ¿Creas contenido para marcas o trabajas en producción? Un solo
                formulario: eliges de qué lado estás y llenas solo lo tuyo. Te
                escribimos cuando salga un proyecto que encaje.
              </p>
              <ul className="gremio-list">
                <li>Creators UGC</li>
                <li>Foto/Video</li>
                <li>Edición</li>
                <li>Color</li>
                <li>Sonido</li>
                <li>Producción</li>
              </ul>
              <a href="#talento" className="btn btn-ghost">
                Postularme <span className="arrow">↓</span>
              </a>
            </article>

            <article className="gremio-card">
              <div className="gremio-num">04 / Herramientas</div>
              <h3>
                Descargables <em>Bushido</em>
              </h3>
              <p>
                Regalos de la casa: LUTs de color, presets, tipografías y plugins
                que usamos en producciones reales.
              </p>
              <ul className="gremio-list">
                <li>LUTs</li>
                <li>Presets</li>
                <li>Tipografías</li>
                <li>Plugins</li>
              </ul>
              <Link href="/descargables" className="btn btn-ghost">
                Ver packs <span className="arrow">→</span>
              </Link>
            </article>
          </div>
        </section>

        {/* Postulación unificada: la primera pregunta decide creator o crew */}
        <section id="talento" style={{ paddingTop: 40 }}>
          <span id="creadores" style={{ display: "block", height: 0 }} aria-hidden="true" />
          <GremioForm />
        </section>

        <section>
          <div className="price-cta">
            <div className="price-cta-text">
              ¿Tu marca necesita contenido <em>ahora</em>?
              <br />
              Pídenos un análisis gratis de tus redes.
            </div>
            <AnalisisButton className="btn btn-primary">
              Quiero mi análisis <span className="arrow">→</span>
            </AnalisisButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
