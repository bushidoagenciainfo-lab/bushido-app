import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DescargaCard, { type Gift } from "@/components/DescargaCard";

export const metadata: Metadata = { title: "Descargables Bushido" };

// Para ENTREGAR el archivo: pon el zip en bushido-app/public/descargables/ con
// el nombre de `file`. Mientras no exista el archivo (file sin definir), la
// tarjeta solo capta el correo y dice "te lo enviamos pronto".
const GIFTS: Gift[] = [
  { tag: "Color · 37 LUTs", title: "Pack de LUTs", desc: "Nuestras conversiones de S-Log3 y looks base .cube, listas para DaVinci, Premiere y FCP.", file: "/descargables/luts-bushido.zip" },
  { tag: "Foto · 10 presets", title: "Presets de foto", desc: "Revelado editorial de Bushido en .xmp para Lightroom móvil y escritorio.", file: "/descargables/presets-bushido.zip" },
  { tag: "Diseño · 9 fuentes", title: "Tipografías", desc: "La selección de fuentes que usamos para títulos y subtítulos.", file: "/descargables/tipografias-bushido.zip" },
  { tag: "Video · 8 recursos", title: "Overlays + presets", desc: "Light leaks en video y presets de efecto (.prfpset) para Premiere.", file: "/descargables/overlays-bushido.zip" },
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
              <DescargaCard key={g.title} gift={g} />
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
