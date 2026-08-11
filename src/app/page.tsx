import Hero from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import { SOCIAL, EMAIL, WHATSAPP } from "@/lib/site";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Bushido — Agencia Audiovisual",
  description:
    "Agencia audiovisual en Bogotá: producción de video, fotografía de artistas, contenido para marcas y comerciales. Análisis gratis en 24 horas.",
  url: "https://bushidoav.com",
  email: EMAIL,
  telephone: `+${WHATSAPP}`,
  priceRange: "$$",
  areaServed: "CO",
  address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
  sameAs: [SOCIAL.instagram, SOCIAL.tiktok, SOCIAL.youtube],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
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

        {/* ── El método: la web vende el sistema, no servicios sueltos ── */}
        <section className="metodo">
          <div className="metodo-head">
            <div className="section-num">El sistema</div>
            <h2>
              Producir es lo último que <em>hacemos</em>.
            </h2>
            <p>
              La mayoría de agencias vende contenido. Un reel suelto no es
              estrategia, es un gasto. Lo valioso no es producir videos: es saber
              cuáles vale la pena producir.
            </p>
          </div>
          <ol className="metodo-pasos">
            {[
              ["01", "Analizamos", "Tu marca, tu competencia y cómo se comporta tu audiencia de verdad."],
              ["02", "Detectamos", "Qué está saturado, qué nadie está haciendo, dónde hay espacio."],
              ["03", "Construimos hipótesis", "Una apuesta concreta, no una corazonada."],
              ["04", "Diseñamos la narrativa", "Concepto, guion y formato salen de la evidencia."],
              ["05", "Producimos", "Aquí entra la cámara. Recién aquí."],
              ["06", "Medimos", "Retención, guardados, alcance nuevo. Lo que indica compra."],
              ["07", "Aprendemos", "Qué funcionó y por qué. Eso entra a tu tablero."],
              ["08", "Volvemos a empezar", "Cada ciclo arranca sabiendo más que el anterior."],
            ].map(([n, titulo, texto]) => (
              <li key={n}>
                <span className="mp-num">{n}</span>
                <div>
                  <strong>{titulo}</strong>
                  <span>{texto}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="metodo-cierre">
            Por eso cada cliente nuevo hace al sistema más inteligente — y esa
            inteligencia trabaja para todos los demás.
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
