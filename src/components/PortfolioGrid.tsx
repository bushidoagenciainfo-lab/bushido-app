"use client";

import { useState } from "react";
import { PORTFOLIO, PORTFOLIO_FILTERS, type PortfolioCat, type PortfolioItem } from "@/lib/site";
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

      <Lightbox item={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}
