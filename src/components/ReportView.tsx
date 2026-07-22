import { WHATSAPP } from "@/lib/site";
import type { Analisis } from "@/lib/analisis";

export default function ReportView({ a }: { a: Analisis }) {
  return (
    <article className="report">
      <div className="rep-header">
        <span className="rh-brand">
          BUSH<em>I</em>DO
        </span>
        <span>Informe de análisis · {a.fecha}</span>
      </div>

      <header className="rep-cover">
        <div className="rc-label">Análisis de marca · Gratis</div>
        <h1>
          {a.marca} <em>bajo la lupa</em>.
        </h1>
        <div className="rc-nicho">
          {a.nicho}
          {a.redes ? ` · ${a.redes}` : ""}
        </div>
        <p className="rc-resumen">{a.resumen}</p>
      </header>

      {/* Diagnóstico */}
      <section className="rep-section">
        <div className="rs-num">01 · Diagnóstico</div>
        <div className="rep-cols">
          <div className="rep-col forta">
            <h4>Fortalezas</h4>
            <ul>
              {a.fortalezas.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="rep-col caren">
            <h4>Carencias</h4>
            <ul>
              {a.carencias.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rep-col oport">
            <h4>Oportunidades</h4>
            <ul>
              {a.oportunidades.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Buyer persona */}
      <section className="rep-section">
        <div className="rs-num">02 · Quién compra</div>
        <div className="rep-persona">
          <div className="rp-name">
            <em>{a.buyerPersona.nombre}</em>
          </div>
          <p className="rp-desc">{a.buyerPersona.descripcion}</p>
          <div className="rp-jtbd">
            {a.buyerPersona.jtbd.map((j) => (
              <span key={j}>{j}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 7 maletas */}
      <section className="rep-section">
        <div className="rs-num">03 · Por qué te compran · las maletas</div>
        <div className="rep-maletas">
          {a.maletas.map((m, i) => (
            <div className="rep-maleta" key={m.nombre}>
              <span className="rm-i">{String(i + 1).padStart(2, "0")}</span>
              <h5>{m.nombre}</h5>
              <p>{m.insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emociones */}
      <section className="rep-section">
        <div className="rs-num">04 · Emociones que mueven la compra</div>
        <div className="rep-emos">
          {a.emociones.map((e) => (
            <span className="emo" key={e}>
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* Propuesta */}
      <section className="rep-section">
        <div className="rs-num">05 · La propuesta</div>
        <div className="rep-propuesta">
          <p className="rp-text">{a.propuesta}</p>
          <div className="rep-paquete">
            <div className="pk-label">Paquete recomendado</div>
            <div className="pk-name">{a.paquete.nombre}</div>
            <div className="pk-price">{a.paquete.precio}</div>
            <p className="pk-why">{a.paquete.porque}</p>
          </div>
        </div>
      </section>

      <div className="rep-cta">
        <div className="rc-t">
          ¿Lo <em>hacemos realidad</em>?
        </div>
        <a
          className="btn btn-primary"
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            `Hola Bushido, vi el análisis de ${a.marca} y quiero avanzar.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hablemos por WhatsApp <span className="arrow">→</span>
        </a>
      </div>
    </article>
  );
}
