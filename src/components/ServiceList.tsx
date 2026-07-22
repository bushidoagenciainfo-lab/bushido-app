"use client";

import { useEffect, useState } from "react";
import { SERVICES, type Service } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";

export default function ServiceList() {
  const [active, setActive] = useState<Service | null>(null);
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
      <div className="services-tiles">
        {SERVICES.map((s) => (
          <button
            key={s.slug}
            type="button"
            className="svc-tile"
            onClick={() => setActive(s)}
          >
            <div className="num">
              {s.num} / {s.cat}
            </div>
            <h3>
              {s.title} <em>{s.titleEm}</em>
            </h3>
            <div className="from">
              Desde <b>{s.packages[0].price}</b>
            </div>
            <span className="go">
              Ver paquetes <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
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
