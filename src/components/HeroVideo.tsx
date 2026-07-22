"use client";

import { useEffect, useRef } from "react";

/**
 * Video de fondo a pantalla completa para el hero.
 * - muted + playsInline + autoPlay + loop → reproducción robusta en todos los navegadores
 *   (móvil incluido; sin sonido para que no bloquee el autoplay).
 * - poster: primer frame estático mientras carga el .mp4 (y fallback si el video no arranca).
 * - reproducción reintentada en efecto por si el navegador bloquea el primer play().
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    // reintenta cuando la pestaña vuelve a estar visible (el preview interno throttlea)
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/portafolio/ferxxo.jpg"
      aria-hidden="true"
    >
      <source src="/hero/hero.mp4" type="video/mp4" />
    </video>
  );
}
