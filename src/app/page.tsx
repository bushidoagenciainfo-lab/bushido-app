import Link from "next/link";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Metodo from "@/components/Metodo";
import LeadForm from "@/components/LeadForm";
import AnalisisButton from "@/components/AnalisisButton";
import Footer from "@/components/Footer";
import {
  SOCIAL, EMAIL, WHATSAPP, BRANDS, HERO_PROOF, TESTIMONIOS, SERVICE_GROUPS, SERVICES, waUrl,
} from "@/lib/site";

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

/** Precio de entrada de cada familia de servicios (ignora los "a cotizar"). */
function desdeGrupo(key: string): string | null {
  const precios = SERVICES.filter((s) => s.grupo === key)
    .map((s) => s.packages[0].price)
    .map((p) => ({ p, n: Number(p.replace(/\D/g, "")) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => a.n - b.n);
  return precios[0]?.p ?? null;
}

export default function Home() {
  const proofHref = HERO_PROOF.url || "/portafolio";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <main>
        <Hero />

        {/* ── Marcas y artistas: la prueba antes que la filosofía ── */}
        <section className="brands" aria-label="Marcas y artistas con los que hemos trabajado">
          <div className="brands-track">
            <span>{BRANDS.join(" · ")}</span>
            <span className="dup" aria-hidden="true">{BRANDS.join(" · ")}</span>
          </div>
        </section>

        {/* ── Trabajo seleccionado ── */}
        <FeaturedWork />

        {/* ── Frase de Bushido (manifiesto) ── */}
        <section className="manifest">
          <div className="manifest-tag">Manifiesto · 01</div>
          <p className="manifest-body">
            La industria vende <span className="quiet">contenido</span>.{" "}
            <em>Nosotros vendemos criterio</em>. Un reel suelto no es estrategia:
            es un gasto. No competimos por cámaras — competimos por inteligencia.
          </p>
        </section>

        {/* ── El sistema: 4 pasos + proceso completo plegado ── */}
        <Metodo />

        {/* ── La prueba: caso con cifras + el informe que entregamos ── */}
        <section className="prueba">
          <div className="section-num">La prueba</div>
          <div className="prueba-grid">
            <div className="prueba-caso">
              <div className="pc-n">43,4M</div>
              <div className="pc-l">vistas orgánicas con una sola pieza · sin pauta</div>
              <p>
                2,7 millones de cuentas alcanzadas y 1,7 millones de me gusta. No
                fue suerte: fue investigar el nicho antes de encender la cámara y
                producir exactamente lo que faltaba.
              </p>
              <a
                className="pc-link"
                href={proofHref}
                target={HERO_PROOF.url ? "_blank" : undefined}
                rel={HERO_PROOF.url ? "noopener noreferrer" : undefined}
              >
                {HERO_PROOF.url ? "Ver la pieza ↗" : "Ver el trabajo →"}
              </a>
            </div>
            <div className="prueba-informe">
              <div className="pi-tag">Así se ve el análisis que te entregamos</div>
              <h3>
                Un informe con tus <em>gatillos</em>, las emociones que mueven a tu nicho y un plan.
              </h3>
              <p>
                El análisis gratis no es un PDF genérico: lee tu Instagram y tu web,
                te dice qué está frenando tu contenido y qué paquete tiene sentido
                para tu caso.
              </p>
              <div className="pi-actions">
                <Link href="/informe/demo" className="btn btn-ghost">
                  Ver un informe de ejemplo <span className="arrow">→</span>
                </Link>
                <AnalisisButton className="btn btn-primary">
                  Pedir el mío gratis <span className="arrow">→</span>
                </AnalisisButton>
              </div>
            </div>
          </div>

          {TESTIMONIOS.length > 0 && (
            <div className="testimonios">
              {TESTIMONIOS.map((t) => (
                <figure className="testimonio" key={t.nombre}>
                  <blockquote>“{t.cita}”</blockquote>
                  <figcaption>
                    {t.nombre} · {t.cargo}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>

        {/* ── Servicios en una pantalla, en español y con precio de entrada ── */}
        <section className="svcres">
          <div className="svcres-head">
            <div>
              <div className="section-num">Servicios</div>
              <h2>
                Lo que <em>armamos</em> para ti.
              </h2>
            </div>
            <Link href="/servicios" className="fw-all">
              Ver todos los precios →
            </Link>
          </div>
          <div className="svcres-grid">
            {SERVICE_GROUPS.map((g, i) => {
              const desde = desdeGrupo(g.key);
              return (
                <Link key={g.key} href={`/servicios#g-${g.key}`} className="svcres-card">
                  <span className="sc-num">0{i + 1}</span>
                  <h3>{g.label}</h3>
                  <p>{g.corto}</p>
                  <span className="sc-from">
                    {desde ? (
                      <>
                        Desde <b>{desde}</b>
                      </>
                    ) : (
                      <b>A cotizar</b>
                    )}
                  </span>
                  <span className="sc-go">Ver paquetes y precios →</span>
                </Link>
              );
            })}
          </div>
          <p className="svcres-note">Precios base en COP · públicos, sin cotizaciones misteriosas.</p>
        </section>

        {/* ── Cierre doble: cotizar o explorar ── */}
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
              <p className="brief-wa">
                ¿Prefieres hablar?{" "}
                <a href={waUrl("Hola Bushido, quiero cotizar un proyecto.")} target="_blank" rel="noopener noreferrer">
                  Escríbenos por WhatsApp ↗
                </a>
              </p>

              <div className="brief-alt">
                <div className="ba-tag">¿Aún no sabes qué necesitas?</div>
                <h3>
                  Empieza por el <em>análisis gratis</em>.
                </h3>
                <p>
                  Te decimos qué está frenando tu contenido y qué paquete tiene
                  sentido, antes de que gastes un peso.
                </p>
                <AnalisisButton className="btn btn-ghost">
                  Pedir mi análisis <span className="arrow">→</span>
                </AnalisisButton>
              </div>
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
              successTitle="Listo."
              successText="Recibimos tu solicitud. Te enviamos la propuesta en menos de 24 horas."
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
