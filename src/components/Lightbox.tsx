"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioItem } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";
import { track } from "@/lib/track";

const foto = (id: string, n: number) =>
  `/portafolio/g/${id}/${String(n).padStart(2, "0")}.jpg`;

/** Álbum del trabajo: portada grande + miniaturas + CTA. */
export default function Lightbox({
  item,
  onClose,
}: {
  item: PortfolioItem | null;
  onClose: () => void;
}) {
  const [i, setI] = useState(1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setI(1), [item?.id]);

  const next = useCallback(() => {
    if (item) setI((v) => (v % item.fotos) + 1);
  }, [item]);
  const prev = useCallback(() => {
    if (item) setI((v) => (v === 1 ? item.fotos : v - 1));
  }, [item]);

  useEffect(() => {
    if (!item) return;
    document.body.classList.add("lb-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("lb-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose, next, prev]);

  if (!item) return null;

  // Deslizar con el dedo (móvil): el gesto natural para pasar fotos.
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  };

  return (
    <div className="lb" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lb-inner">
        <header className="lb-head">
          <div>
            <div className="lb-cat">{item.label}</div>
            <h3>
              {item.title} <span>· {item.client}</span>
            </h3>
          </div>
          <button type="button" className="lb-close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="lb-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {item.fotos > 1 && (
            <button type="button" className="lb-nav prev" onClick={prev} aria-label="Anterior">
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto(item.id, i)} alt={`${item.title} — foto ${i}`} />
          {item.fotos > 1 && (
            <button type="button" className="lb-nav next" onClick={next} aria-label="Siguiente">
              ›
            </button>
          )}
          <span className="lb-count">
            {i} / {item.fotos}
          </span>
          {item.fotos > 1 && <span className="lb-swipe">Desliza →</span>}
        </div>

        {item.fotos > 1 && (
          <div className="lb-thumbs">
            {Array.from({ length: item.fotos }, (_, k) => k + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={"lb-thumb" + (n === i ? " on" : "")}
                onClick={() => setI(n)}
                style={{ backgroundImage: `url('${foto(item.id, n)}')` }}
                aria-label={`Foto ${n}`}
              />
            ))}
          </div>
        )}

        <footer className="lb-foot">
          {item.reels?.length ? (
            <div className="lb-reels">
              {item.reels.map((url, k) => (
                <a
                  key={url}
                  className="btn btn-ghost lb-reel"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("reel", item.title)}
                >
                  <span className="lb-play" aria-hidden="true">
                    ▶
                  </span>
                  {item.reels!.length > 1 ? `Reel ${k + 1}` : "Ver el reel"}
                  <span className="arrow">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <span className="lb-note">Fotografía y video · producción Bushido</span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              openAnalisis("portafolio");
            }}
          >
            Quiero algo así <span className="arrow">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
