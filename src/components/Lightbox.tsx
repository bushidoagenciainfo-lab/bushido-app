"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";
import { track } from "@/lib/track";

const nn = (n: number) => String(n).padStart(2, "0");
const foto = (id: string, n: number) => `/portafolio/g/${id}/${nn(n)}.jpg`;
const video = (id: string, n: number) => `/video/${id}/${nn(n)}.mp4`;

type Slide = { tipo: "video" | "foto"; src: string };

/** Álbum del trabajo: video(s) + fotos + CTA. */
export default function Lightbox({
  item,
  onClose,
}: {
  item: PortfolioItem | null;
  onClose: () => void;
}) {
  const [i, setI] = useState(1);
  // Proporción real del clip. El navegador NO la deduce solo en un <video> con
  // alto fijo (se estira a todo el ancho), así que la medimos y la aplicamos.
  const [ratio, setRatio] = useState<string | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Los videos van primero: es lo que más peso tiene y lo primero que se ve.
  const slides = useMemo<Slide[]>(() => {
    if (!item) return [];
    const vids = Array.from({ length: item.videos ?? 0 }, (_, k) => ({
      tipo: "video" as const,
      src: video(item.id, k + 1),
    }));
    const fotos = Array.from({ length: item.fotos }, (_, k) => ({
      tipo: "foto" as const,
      src: foto(item.id, k + 1),
    }));
    return [...vids, ...fotos];
  }, [item]);

  const total = slides.length;

  useEffect(() => {
    setI(1);
    setRatio(null);
  }, [item?.id]);

  const next = useCallback(() => {
    if (total) setI((v) => (v % total) + 1);
  }, [total]);
  const prev = useCallback(() => {
    if (total) setI((v) => (v === 1 ? total : v - 1));
  }, [total]);

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

  const actual = slides[i - 1];

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
          {total > 1 && (
            <button type="button" className="lb-nav prev" onClick={prev} aria-label="Anterior">
              ‹
            </button>
          )}

          {actual?.tipo === "video" ? (
            <video
              key={actual.src}
              className="lb-video"
              src={actual.src}
              poster={foto(item.id, 1)}
              controls
              playsInline
              preload="metadata"
              style={ratio ? { aspectRatio: ratio } : undefined}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) setRatio(`${v.videoWidth} / ${v.videoHeight}`);
              }}
              onPlay={() => track("video", item.title)}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={actual?.src} alt={`${item.title} — foto ${i}`} />
          )}

          {total > 1 && (
            <button type="button" className="lb-nav next" onClick={next} aria-label="Siguiente">
              ›
            </button>
          )}
          <span className="lb-count">
            {i} / {total}
          </span>
          {total > 1 && <span className="lb-swipe">Desliza →</span>}
        </div>

        {total > 1 && (
          <div className="lb-thumbs">
            {slides.map((s, k) => (
              <button
                key={s.src}
                type="button"
                className={
                  "lb-thumb" + (k + 1 === i ? " on" : "") + (s.tipo === "video" ? " is-video" : "")
                }
                onClick={() => setI(k + 1)}
                style={{
                  backgroundImage: `url('${s.tipo === "video" ? foto(item.id, 1) : s.src}')`,
                }}
                aria-label={s.tipo === "video" ? `Video ${k + 1}` : `Foto ${k + 1}`}
              >
                {s.tipo === "video" && <span aria-hidden="true">▶</span>}
              </button>
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
