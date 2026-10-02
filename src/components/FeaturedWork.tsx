"use client";

import { useState } from "react";
import Link from "next/link";
import { PORTFOLIO, HOME_FEATURED, type PortfolioItem } from "@/lib/site";
import { track } from "@/lib/track";
import Lightbox from "./Lightbox";

const ITEMS = HOME_FEATURED.map((id) => PORTFOLIO.find((p) => p.id === id)).filter(Boolean) as PortfolioItem[];

/** Trabajo seleccionado en la home: 6 piezas, 2 grandes + 4 medianas, video en hover. */
export default function FeaturedWork() {
  const [abierto, setAbierto] = useState<PortfolioItem | null>(null);

  const play = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = e.currentTarget.querySelector("video");
    if (!v) return;
    v.play().then(() => v.classList.add("on")).catch(() => {});
  };
  const stop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = e.currentTarget.querySelector("video");
    if (!v) return;
    v.pause();
    v.classList.remove("on");
  };

  return (
    <section className="fw" id="trabajo">
      <div className="fw-head">
        <div>
          <div className="section-num">Trabajo seleccionado</div>
          <h2>
            Esto ya se <em>hizo</em>.
          </h2>
        </div>
        <Link href="/portafolio" className="fw-all">
          Ver los {PORTFOLIO.length} proyectos →
        </Link>
      </div>

      <div className="fw-grid">
        {ITEMS.map((p, i) => {
          const esVideo = Boolean(p.videos);
          const esReel = !esVideo && Boolean(p.reels?.length);
          return (
            <button
              key={p.id}
              type="button"
              className={"fw-card" + (i < 2 ? " big" : "")}
              onClick={() => {
                track("portafolio", p.title, { origen: "home" });
                setAbierto(p);
              }}
              onMouseEnter={esVideo ? play : undefined}
              onMouseLeave={esVideo ? stop : undefined}
              aria-label={`${p.title} · ${p.client}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="fw-img"
                src={`/portafolio/g/${p.id}/cover.webp`}
                alt={`${p.title} · ${p.client} — ${p.label} producido por Bushido`}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
              />
              {esVideo && (
                <video
                  className="fw-video"
                  src={`/video/${p.id}/01.mp4`}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden="true"
                />
              )}
              <div className="fw-scrim" />
              <span className={"fw-badge" + (esVideo || esReel ? " fw-badge--video" : "")}>
                {esVideo || esReel ? <b aria-hidden="true">▶</b> : null}
                {esVideo ? "Video" : esReel ? "Reel" : "Foto"}
              </span>
              <div className="fw-meta">
                <div>
                  <div className="fw-cat">{p.label}</div>
                  <div className="fw-title">{p.title}</div>
                </div>
                <div className="fw-client">{p.client}</div>
              </div>
            </button>
          );
        })}
      </div>

      <Lightbox item={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}
