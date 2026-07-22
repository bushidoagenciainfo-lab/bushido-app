import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import { WHATSAPP, EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contacto · Bushido" };

export default function ContactoPage() {
  return (
    <>
      <main>
        <div className="view-header">
          <div className="view-header-inner">
            <div>
              <div className="view-header-eyebrow">04 · Contacto</div>
              <h1>
                Escríbenos <em>directo</em>.
              </h1>
            </div>
            <p>
              Un mensaje corto sobre tu proyecto es suficiente. Respondemos el
              mismo día — casi siempre antes.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 60 }}>
          <div className="contacto-info">
            <div className="info-block">
              <div className="num">Canal · 01</div>
              <h3>
                <em>WhatsApp</em> directo
              </h3>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hola%20Bushido%2C%20quiero%20hablar%20de%20un%20proyecto`}
                target="_blank"
                rel="noopener"
              >
                +57 300 892 3390
              </a>
              <p className="sub">Respondemos en horario laboral</p>
            </div>
            <div className="info-block">
              <div className="num">Canal · 02</div>
              <h3>
                Correo <em>empresarial</em>
              </h3>
              <a href={`mailto:${EMAIL}?subject=Proyecto%20nuevo`}>{EMAIL}</a>
              <p className="sub">Para briefs largos y adjuntos</p>
            </div>
            <div className="info-block">
              <div className="num">Base · Bogotá</div>
              <h3>
                Colombia <em>·</em> D.C.
              </h3>
              <p>Servicio nacional</p>
              <p className="sub">Lunes a sábado · 9 a 19h</p>
            </div>
          </div>

          <div className="brief-wrap" style={{ maxWidth: 1200 }}>
            <div className="brief-copy">
              <div className="section-num">Formulario</div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(36px, 4.5vw, 64px)",
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "var(--bone)",
                  marginBottom: 20,
                }}
              >
                O usa el <em style={{ color: "var(--sepp)", fontStyle: "italic" }}>brief</em>.
              </h2>
              <p style={{ color: "var(--bone-dim)", fontSize: 15, lineHeight: 1.6 }}>
                Rellena estos campos y te contactamos con una propuesta. Es el
                camino más rápido si ya sabes lo que necesitas.
              </p>
            </div>

            <LeadForm
              kind="contacto"
              subtitle="Formulario · brief inicial"
              title={
                <>
                  Tu <em>propuesta a medida</em>.
                </>
              }
              submitLabel="Enviar"
              successTitle="¡Listo!"
              successText="Recibimos tu brief. Te contactamos en menos de 24h con una propuesta."
              legal
              fields={[
                { name: "name", label: "Nombre", required: true, placeholder: "Tu nombre" },
                { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@correo.com" },
                { name: "phone", label: "WhatsApp", type: "tel", required: true, prefix: "+57", placeholder: "300 000 0000" },
                {
                  name: "project",
                  label: "Tipo de proyecto",
                  as: "select",
                  required: true,
                  placeholder: "Selecciona uno",
                  options: [
                    "Videoclip musical",
                    "Cobertura de evento",
                    "Reels / contenido de marca",
                    "Mini comercial / campaña",
                    "Video corporativo",
                    "Video de producto",
                    "Fotografía editorial",
                    "Otro / múltiples",
                  ],
                },
                {
                  name: "message",
                  label: "Cuéntanos en 2 líneas",
                  as: "textarea",
                  full: true,
                  optionalHint: "opcional",
                  placeholder: "Ej: Lanzamos un producto en octubre y necesitamos 3 reels + fotos de campaña...",
                },
              ]}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
