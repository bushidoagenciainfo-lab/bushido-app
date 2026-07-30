"use client";

import { useState } from "react";
import { PORTFOLIO, PORTFOLIO_FILTERS, type PortfolioCat } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";
import { track } from "@/lib/track";

export default function PortfolioGrid() {
  const [filter, setFilter] = useState<"todos" | PortfolioCat>("todos");
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
          {visible.length} {visible.length === 1 ? "pieza" : "piezas"}
        </div>
      </div>

      <div className="fichas-grid">
        {visible.map((p) => {
          // Contenido de la ficha (igual con o sin reel publicado)
          const inner = (
            <>
              <div className="art" style={{ backgroundImage: `url('/portafolio/${p.file}.jpg')` }} />
              <div className="scrim" />
              <div className="badge">{p.badge}</div>
              <div className="lock">{p.link ? "Ver reel ↗" : "Privado"}</div>
              <div className="frame-outline" />
              <div className="meta">
                <div className="meta-left">
                  <div className="cat">{p.label}</div>
                  <div className="title">{p.title}</div>
                </div>
                <div className="client">{p.client}</div>
              </div>
            </>
          );
          // Si la pieza tiene reel publicado, la ficha lleva a verlo.
          return p.link ? (
            <a
              key={p.file}
              className="card"
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("portafolio", p.title)}
            >
              {inner}
            </a>
          ) : (
            <button key={p.file} type="button" className="card" onClick={openAnalisis}>
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
