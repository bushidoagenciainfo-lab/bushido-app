import { WHATSAPP } from "@/lib/site";
import type { Analisis, EstadoCanal } from "@/lib/analisis";
import Emociones from "./Emociones";

// clase css sin acentos para el badge de estado del canal
const estadoKey: Record<EstadoCanal, string> = {
  activo: "activo",
  fuerte: "fuerte",
  irregular: "irregular",
  "débil": "debil",
  ausente: "ausente",
  "por confirmar": "confirmar", // legado (informes viejos)
};

export default function ReportView({ a }: { a: Analisis }) {
  const canales = a.canales ?? [];
  const metricas = a.metricas ?? [];
  const detalle = a.emocionesDetalle ?? [];

  return (
    <article className="report">
      <div className="rep-header">
        <span className="rh-brand">
          BUSH<em>I</em>DO
        </span>
        <span>Informe de análisis · {a.fecha}</span>
      </div>

      <header className="rep-cover">
        <div className="rc-label">Análisis de marca · Método Kansei</div>
        <h1>
          {a.marca} <em>bajo la lupa</em>.
        </h1>
        <div className="rc-nicho">
          {a.nicho}
          {a.redes ? ` · ${a.redes}` : ""}
        </div>
        <p className="rc-resumen">{a.resumen}</p>
      </header>

      <div className="rep-body">
        {/* Diagnóstico */}
        <section className="rep-section">
          <div className="rs-num">01 · La radiografía</div>
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
          <div className="rs-num">02 · A quién le hablas</div>
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

        {/* Gatillos de compra */}
        <section className="rep-section">
          <div className="rs-num">03 · Los gatillos · por qué te compran</div>
          <div className="rep-maletas">
            {a.gatillos.map((m, i) => (
              <div className="rep-maleta" key={m.nombre}>
                <span className="rm-i">{String(i + 1).padStart(2, "0")}</span>
                <h5>{m.nombre}</h5>
                <p>{m.insight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Emociones (interactivas) */}
        {detalle.length > 0 && (
          <section className="rep-section">
            <div className="rs-num">04 · Las emociones que disparan la compra</div>
            <Emociones detalle={detalle} />
          </section>
        )}

        {/* Presencia digital */}
        {canales.length > 0 && (
          <section className="rep-section">
            <div className="rs-num">05 · Tu presencia hoy</div>
            <div className="rep-canales">
              {canales.map((c) => (
                <div className="canal-row" key={c.canal}>
                  <div className="canal-head">
                    <span className="canal-name">{c.canal}</span>
                    <span className={"canal-badge est-" + estadoKey[c.estado]}>{c.estado}</span>
                  </div>
                  <p className="canal-nota">{c.nota}</p>
                  <p className="canal-rec">
                    <span>Recomendación</span> {c.recomendacion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Qué medir */}
        {metricas.length > 0 && (
          <section className="rep-section">
            <div className="rs-num">06 · Qué medir en tus redes</div>
            <div className="rep-metricas">
              {metricas.map((m) => (
                <div className="metrica" key={m.nombre}>
                  <h5>{m.nombre}</h5>
                  <p className="met-line">
                    <span>Qué mirar</span> {m.queMirar}
                  </p>
                  <p className="met-line">
                    <span>Por qué</span> {m.porQue}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Propuesta */}
        <section className="rep-section">
          <div className="rs-num">07 · El plan de Bushido</div>
          <div className="rep-propuesta">
            <p className="rp-text">{a.propuesta}</p>
            <div className="rep-paquete">
              <div className="pk-label">Paquete recomendado</div>
              <div className="pk-name">{a.paquete.nombre}</div>
              <div className="pk-price">
                <span className="pk-desde">Inversión desde</span>
                {a.paquete.precioDesde ?? a.paquete.precio}
              </div>
              <p className="pk-why">{a.paquete.porque}</p>
              {a.paquete.incentivo && (
                <div className="pk-incentivo">
                  <span className="pk-bolt" aria-hidden="true">⚡</span>
                  <div>
                    <p>{a.paquete.incentivo}</p>
                    <span className="pk-cupos">
                      Tomamos pocas marcas nuevas al mes · cupos limitados.
                    </span>
                  </div>
                </div>
              )}
              <a
                className="btn btn-primary pk-cta"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  `Hola Bushido, vi el análisis de ${a.marca} y quiero reservar mi arranque del ${a.paquete.nombre}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reservar mi arranque <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>

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
