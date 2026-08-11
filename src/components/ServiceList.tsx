"use client";

import { useEffect, useState } from "react";
import { SERVICES, SERVICE_GROUPS, type Service } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";

/** Valor numérico de un precio, o null si es "Cotización por proyecto" y similares. */
function precioNum(p: string): number | null {
  const n = p.replace(/\D/g, "");
  return n ? Number(n) : null;
}

export default function ServiceList() {
  const [active, setActive] = useState<Service | null>(null);
  // Categoría desplegada. Arranca abierta la primera para que no se vea vacío.
  const [openCat, setOpenCat] = useState<string | null>(SERVICE_GROUPS[0].key);
  const open = active !== null;

  useEffect(() => {
    document.body.classList.toggle("drawer-open", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="svc-cats">
        {SERVICE_GROUPS.map((g) => {
          const items = SERVICES.filter((s) => s.grupo === g.key).sort((a, b) =>
            a.num.localeCompare(b.num)
          );
          if (!items.length) return null;
          const abierta = openCat === g.key;
          // El "desde" ignora los servicios que solo se cotizan (sin cifra).
          const conCifra = items
            .map((s) => ({ p: s.packages[0].price, n: precioNum(s.packages[0].price) }))
            .filter((x): x is { p: string; n: number } => x.n !== null)
            .sort((a, b) => a.n - b.n);
          const desde = conCifra.length ? `desde ${conCifra[0].p}` : "a cotizar";
          return (
            <div className={"svc-cat" + (abierta ? " open" : "")} key={g.key}>
              <button
                type="button"
                className="svc-cat-head"
                onClick={() => setOpenCat(abierta ? null : g.key)}
                aria-expanded={abierta}
              >
                <div className="scc-text">
                  <h2>{g.label}</h2>
                  <span>{g.hint}</span>
                </div>
                <div className="scc-right">
                  <span className="scc-count">{items.length} servicios</span>
                  <span className="scc-from">{desde}</span>
                  <span className="scc-toggle" aria-hidden="true">
                    {abierta ? "−" : "+"}
                  </span>
                </div>
              </button>

              {abierta && (
                <div className="services-tiles">
                  {items.map((s) => (
                    <button key={s.slug} type="button" className="svc-tile" onClick={() => setActive(s)}>
                      <div className="num">
                        {s.num} / {s.cat}
                      </div>
                      <h3>
                        {s.title} <em>{s.titleEm}</em>
                      </h3>
                      <div className="from">
                        {precioNum(s.packages[0].price) === null ? (
                          <b>{s.packages[0].price}</b>
                        ) : (
                          <>
                            Desde <b>{s.packages[0].price}</b>
                          </>
                        )}
                      </div>
                      <span className="go">
                        Ver paquetes <span aria-hidden="true">→</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={"drawer-backdrop" + (open ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActive(null);
        }}
      >
        <aside className={"drawer" + (open ? " open" : "")} role="dialog" aria-modal="true">
          <button className="drawer-close" aria-label="Cerrar" onClick={() => setActive(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {active && (
            <>
              <div className="d-cat">
                {active.num} · {active.cat}
              </div>
              <h3>
                {active.title} <em>{active.titleEm}</em>
              </h3>
              <p className="d-desc">{active.description}</p>

              <div className="d-label">Paquetes</div>
              <div className="rows">
                {active.packages.map((p) => (
                  <div key={p.name} className={"row" + (p.featured ? " featured" : "")}>
                    <span className="lbl">{p.name}</span>
                    <span className="val">{p.price}</span>
                    {p.incluye?.length ? (
                      <ul className="row-incluye">
                        {p.incluye.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="d-label">Incluye</div>
              <ul className="benefits">
                {active.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <p className="d-note">{active.note}</p>

              <button className="btn btn-primary" onClick={openAnalisis}>
                Pedir propuesta <span className="arrow">→</span>
              </button>
              <p className="legal-note" style={{ textAlign: "center", marginTop: 12 }}>
                Precio base en COP · el valor final se afina en la conversación.
              </p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
