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
      {/* El trabajo en movimiento va ARRIBA: Bushido vende video, no solo fotos. */}
      {(filter === "todos" || filter === "moda") && (
        <div className="reels-sueltos top" id="reels">
          <div className="rs-head">
            <div className="rs-num">En movimiento</div>
            <h2>
              Reels <em>publicados</em>.
            </h2>
            <p>
              Campañas que salieron en video para adidas y Nike. Ábrelas en
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

      <div className="filter-bar">
        {PORTFOLIO_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={"filter-btn" + (filter === f.key ? " active" : "")}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="art"
              src={`/portafolio/g/${p.id}/cover.webp`}
              alt={`${p.title} · ${p.client} — ${p.label} producido por Bushido`}
              loading="lazy"
              decoding="async"
            />
            <div className="scrim" />
            <div className="badge">{p.label}</div>
            {p.videos || p.reels?.length ? (
              <div className="badge-reel">
                <span aria-hidden="true">▶</span>
                {p.videos
                  ? p.videos > 1
                    ? `${p.videos} videos`
                    : "Video"
                  : p.reels!.length > 1
                    ? `${p.reels!.length} reels`
                    : "Reel"}
              </div>
            ) : null}
            <div className="lock">
              {p.fotos} fotos{p.videos ? ` · ${p.videos} video${p.videos > 1 ? "s" : ""}` : ""}
            </div>
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

      <Lightbox item={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}
