"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LeadForm from "./LeadForm";
import { ANALISIS_EVENT } from "@/lib/ui";
import { track } from "@/lib/track";

// v4 (auditoría oct 2026): el pop-up ya NO se abre al cargar. Se dispara por
// intención: medio scroll, 25 s en la página o intento de salir (desktop).
// En móvil, en vez del modal completo aparece una barra inferior discreta.
const SHOWN_KEY = "bushido_modal_shown_v4";
const REAPARECE_DIAS = 7;
const AUTO_OPEN_MS = 25_000;
const SCROLL_PCT = 0.5;
const MOBILE = "(max-width: 820px)";
// Páginas donde el visitante ya está haciendo algo concreto: no interrumpir.
const EXCLUIDAS = ["/contacto", "/equipos", "/brief", "/admin", "/informe", "/politica-datos", "/terminos"];

function bloqueado() {
  const b = document.body.classList;
  return b.contains("modal-open") || b.contains("drawer-open") || b.contains("lb-open") || b.contains("no-popup");
}

export default function AnalisisModal() {
  const [open, setOpen] = useState(false);
  const [bar, setBar] = useState(false);
  const pathname = usePathname() || "/";

  const abrir = useCallback(() => {
    setBar(false);
    setOpen(true);
  }, []);

  // Apertura manual desde cualquier CTA + Escape para cerrar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setBar(false);
      }
    };
    window.addEventListener(ANALISIS_EVENT, abrir);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(ANALISIS_EVENT, abrir);
      window.removeEventListener("keydown", onKey);
    };
  }, [abrir]);

  // Disparo por intención (una vez cada REAPARECE_DIAS).
  useEffect(() => {
    if (EXCLUIDAS.some((p) => pathname.startsWith(p))) return;
    try {
      const visto = localStorage.getItem(SHOWN_KEY);
      if (visto) {
        const dias = (Date.now() - Number(visto)) / 86_400_000;
        if (Number.isFinite(dias) && dias < REAPARECE_DIAS) return;
      }
    } catch {}

    let hecho = false;
    const disparar = (origen: string) => {
      if (hecho || bloqueado()) return;
      hecho = true;
      limpiar();
      try {
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch {}
      track("popup", origen);
      if (window.matchMedia(MOBILE).matches) {
        setBar(true);
      } else {
        setOpen(true);
      }
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_PCT) disparar("scroll");
    };
    const onLeave = (e: MouseEvent) => {
      // intento de salir: el mouse sube hasta la barra del navegador
      if (e.clientY <= 0 && !window.matchMedia(MOBILE).matches) disparar("exit");
    };
    const timer = window.setTimeout(() => disparar("tiempo"), AUTO_OPEN_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    function limpiar() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
    }
    return limpiar;
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    if (open) {
      try {
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch {}
    }
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("bar-open", bar);
  }, [bar]);

  return (
    <>
      {/* Barra inferior (móvil): invita sin tapar la página */}
      <div className={"analisis-bar" + (bar ? " show" : "")} aria-hidden={!bar}>
        <div className="ab-text">
          <small>Gratis · en menos de 24 h</small>
          Análisis de tus redes y tu web
        </div>
        <button type="button" className="ab-go" onClick={() => { track("cta", "analisis", { origen: "barra" }); abrir(); }}>
          Pedirlo →
        </button>
        <button type="button" className="ab-x" aria-label="Cerrar" onClick={() => setBar(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        className={"modal-backdrop" + (open ? " open" : "")}
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="modal" role="dialog" aria-modal="true" aria-label="Pide tu análisis gratis">
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <aside className="modal-hook" aria-hidden="true">
            <div className="modal-hook-top">
              <div className="modal-eyebrow">Regalo de bienvenida · Gratis</div>
              <h2>
                Analizamos tus redes y tu web <em>gratis</em>
              </h2>
              <p className="lead">
                En menos de 24 horas recibes un informe con lo que está frenando tu
                contenido, las emociones que mueven a tu nicho y un plan concreto —
                con el criterio de Bushido.
              </p>
            </div>
            <ul className="modal-perks">
              <li>Qué está frenando tu contenido hoy</li>
              <li>Oportunidades que no estás aprovechando</li>
              <li>Un plan claro y un paquete a tu medida</li>
            </ul>
            <a className="modal-demo" href="/informe/demo" target="_blank" rel="noopener">
              Ver un informe de ejemplo ↗
            </a>
            <div className="brandmark">
              BUSH<em>I</em>DO · bushidoav.com
            </div>
          </aside>

          <div className="modal-form-wrap">
            <div className="modal-intro">
              <div className="mi-tag">Regalo de bienvenida · Gratis</div>
              <p>
                Analizamos tus redes y tu web y te mandamos un <strong>informe con
                tus puntos débiles, tus oportunidades y un plan</strong> — a tu correo,
                en menos de 24 horas.{" "}
                <a href="/informe/demo" target="_blank" rel="noopener">Ver un ejemplo ↗</a>
              </p>
            </div>

            <LeadForm
              kind="analisis"
              subtitle="Análisis gratis · 4 datos y listo"
              title={
                <>
                  ¿A dónde te <em>mandamos</em> el informe?
                </>
              }
              submitLabel="Quiero mi análisis"
              successTitle="Recibido."
              successText="Tu informe llega a tu correo en menos de 24 horas (casi siempre en minutos). Lo escribimos leyendo tu Instagram y tu web: con tus datos, no con frases genéricas."
              legal
              fields={[
                { name: "name", label: "Nombre", required: true, full: true, placeholder: "Tu nombre" },
                { name: "social", label: "Instagram de tu marca", required: true, full: true, placeholder: "@tumarca (o el link)" },
                { name: "email", label: "Email", type: "email", required: true, full: true, placeholder: "tu@correo.com" },
                { name: "phone", label: "WhatsApp", type: "tel", required: true, full: true, prefix: "+57", placeholder: "300 000 0000" },
                {
                  name: "project",
                  label: "¿Qué buscas?",
                  as: "select",
                  full: true,
                  optionalHint: "opcional",
                  placeholder: "Elige si ya lo sabes",
                  options: [
                    "Manejo de redes",
                    "Creadores / UGC para mi marca",
                    "Un videoclip",
                    "Un comercial / campaña",
                    "Cobertura de evento",
                    "Fotografía",
                    "Aún no sé",
                    "Soy creador o freelance",
                  ],
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
