import Hero from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* ── Frase de Bushido (manifiesto) ── */}
        <section className="manifest">
          <div className="manifest-tag">Manifiesto · 01</div>
          <p className="manifest-body">
            El equipo es el <span className="quiet">mínimo</span>.{" "}
            <em>El criterio es la diferencia</em>. Cualquiera puede rentar una
            cámara — nosotros construimos la mirada que hace que el metraje valga
            la pena.
          </p>
        </section>

        {/* ── Cotización ── */}
        <section className="brief" id="cotizacion">
          <div className="brief-wrap">
            <div className="brief-copy">
              <div className="section-num">Cotización</div>
              <h2>
                Cuéntanos lo que <em>quieres hacer</em>.
              </h2>
              <p>
                En menos de 24 horas te enviamos una propuesta con referencias
                visuales, cronograma tentativo y rango real de inversión. Sin
                rodeos, sin plantillas.
              </p>
              <ul className="brief-perks">
                <li>
                  Cotización realista · <span>no un número al aire</span>
                </li>
                <li>
                  Referencias + storyboard rápido · <span>en el mismo documento</span>
                </li>
                <li>
                  Respuesta en 24h · <span>casi siempre antes</span>
                </li>
              </ul>
            </div>

            <LeadForm
              kind="contacto"
              subtitle="Formulario · cotización"
              title={
                <>
                  Tu <em>propuesta a medida</em>.
                </>
              }
              submitLabel="Pedir cotización"
              successTitle="¡Listo!"
              successText="Recibimos tu solicitud. Te enviamos la propuesta en menos de 24h."
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
                  placeholder: "Ej: Lanzamos un producto en octubre y necesitamos 3 reels + fotos...",
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
