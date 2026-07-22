import type { Metadata } from "next";
import AnalisisButton from "@/components/AnalisisButton";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Descargables Bushido" };

const GIFTS = [
  { tag: "Color · 10 LUTs", title: "Pack de LUTs", desc: "Nuestro look base de color, listo para DaVinci, Premiere y FCP." },
  { tag: "Foto · 12 presets", title: "Presets de foto", desc: "Revelado editorial de Bushido para Lightroom móvil y escritorio." },
  { tag: "Diseño · 6 fuentes", title: "Tipografías", desc: "La selección de fuentes que usamos para títulos y subtítulos." },
  { tag: "Video · overlays", title: "Overlays + plugins", desc: "Texturas de grano, film burn y transiciones para tus ediciones." },
];

export default function DescargablesPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">Descargables Bushido</div>
              <h1>
                Regalos de <em>Bushido</em>.
              </h1>
            </div>
            <p>
              Recursos que usamos en producciones reales, gratis para la
              comunidad. Deja tu correo y te llegan.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 60 }}>
          <div className="downloads-head" style={{ padding: 0 }}>
            <div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,3.4vw,44px)", fontWeight: 400, color: "var(--bone)" }}>
                Regalos <em style={{ fontStyle: "italic", color: "var(--gold)" }}>gratis</em>
              </h2>
            </div>
            <div className="sub">Gratis · deja tu correo y te llegan</div>
          </div>

          <div className="downloads-grid" style={{ marginTop: 28 }}>
            {GIFTS.map((g) => (
              <AnalisisButton key={g.title} className="dl-card">
                <div className="dl-tag">{g.tag}</div>
                <h4>{g.title}</h4>
                <p>{g.desc}</p>
                <span className="dl-cta">
                  Descargar gratis <span aria-hidden="true">↗</span>
                </span>
              </AnalisisButton>
            ))}
          </div>
        </section>

        {/* Preparado para futuros packs premium / de pago */}
        <section>
          <div className="coming-soon">
            <div className="cs-tag">Packs premium</div>
            <h3>Muy pronto.</h3>
            <p>
              Estamos preparando packs premium y recursos exclusivos. Por ahora,
              disfruta los regalos de la casa.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
