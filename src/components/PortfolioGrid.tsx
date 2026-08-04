"use client";

import { useState } from "react";
import { PORTFOLIO, PORTFOLIO_FILTERS, REELS, type PortfolioCat, type PortfolioItem } from "@/lib/site";
import { track } from "@/lib/track";
import Lightbox from "./Lightbox";

export default function PortfolioGrid() {
  const [filter, setFilter] = useState<"todos" | PortfolioCat>("todos");
  const [abierto, setAbierto] = useState<PortfolioItem | null>(null);
  const visible = PORTFOLIO.filter((p) => filter === "todos" || p.cat === filter);

  return (
    <section style={{ paddingTop: 20 }}>
      <div className="filter-bar">
        {PORTFOLIO_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={"filter-btn" + (filter === f.key ? " active" : "")}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <div className="filter-count">
          {visible.length} {visible.length === 1 ? "proyecto" : "proyectos"}
        </div>
      </div>

      <div className="fichas-grid">
        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            className="card"
            onClick={() => {
              track("portafolio", p.title);
              setAbierto(p);
            }}
          >
            <div
              className="art"
              style={{ backgroundImage: `url('/portafolio/g/${p.id}/01.jpg')` }}
            />
            <div className="scrim" />
            <div className="badge">{p.label}</div>
            {p.reels?.length ? (
              <div className="badge-reel">
                <span aria-hidden="true">▶</span>
                {p.reels.length > 1 ? `${p.reels.length} reels` : "Reel"}
              </div>
            ) : null}
            <div className="lock">{p.fotos} fotos</div>
            <div className="frame-outline" />
            <div className="meta">
              <div className="meta-left">
                <div className="cat">{p.label}</div>
                <div className="title">{p.title}</div>
              </div>
              <div className="client">{p.client}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Campañas que salieron solo en video (sin galería de fotos propia) */}
      {(filter === "todos" || filter === "moda") && (
        <div className="reels-sueltos">
          <div className="rs-head">
            <div className="rs-num">También en movimiento</div>
            <h2>
              Reels <em>publicados</em>.
            </h2>
            <p>
              Campañas que salieron en video para las marcas. Ábrelas en
              Instagram — están publicadas.
            </p>
          </div>
          <div className="rs-grid">
            {REELS.map((r) => (
              <a
                key={r.url}
                className="rs-card"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("reel", r.titulo)}
              >
                <span className="rs-play" aria-hidden="true">
                  ▶
                </span>
                <span className="rs-body">
                  <span className="rs-client">{r.cliente}</span>
                  <span className="rs-title">{r.titulo}</span>
                </span>
                <span className="rs-go" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <Lightbox item={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}
