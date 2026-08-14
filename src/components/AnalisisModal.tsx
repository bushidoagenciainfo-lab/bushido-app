"use client";

import { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { ANALISIS_EVENT } from "@/lib/ui";

// v3: guarda la FECHA en que se mostró (antes guardaba "1" y no volvía a salir nunca).
const SHOWN_KEY = "bushido_modal_shown_v3";
// Si el visitante ya lo vio, vuelve a aparecer pasados estos días.
const REAPARECE_DIAS = 3;
// Segundos antes de que el pop-up aparezca solo (una vez por visitante).
// Súbelo/bájalo aquí a gusto.
const AUTO_OPEN_MS = 900;

export default function AnalisisModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openFn = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(ANALISIS_EVENT, openFn);
    window.addEventListener("keydown", onKey);

    // auto-abre una sola vez, a los 14s
    let auto = true;
    try {
      const visto = localStorage.getItem(SHOWN_KEY);
      if (visto) {
        const dias = (Date.now() - Number(visto)) / 86_400_000;
        auto = !Number.isFinite(dias) || dias >= REAPARECE_DIAS;
      }
    } catch {}
    const t = auto
      ? window.setTimeout(() => {
          if (!document.body.classList.contains("modal-open")) setOpen(true);
        }, AUTO_OPEN_MS)
      : undefined;

    return () => {
      window.removeEventListener(ANALISIS_EVENT, openFn);
      window.removeEventListener("keydown", onKey);
      if (t) window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    if (open) {
      try {
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch {}
    }
  }, [open]);

  return (
    <div
      className={"modal-backdrop" + (open ? " open" : "")}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Pide tu análisis gratis">
        <button className="modal-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
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
              Un diagnóstico breve con tus puntos débiles, tus oportunidades de
              mercado y por dónde crecer — con el criterio de Bushido, en menos de
              24 horas.
            </p>
          </div>
          <ul className="modal-perks">
            <li>Qué está frenando tu contenido hoy</li>
            <li>Oportunidades que no estás aprovechando</li>
            <li>Un plan claro y un paquete a tu medida</li>
          </ul>
          <div className="brandmark">
            BUSH<em>I</em>DO · bushidoav.com
          </div>
        </aside>

        <div className="modal-form-wrap">
          {/* En móvil el panel de la izquierda (.modal-hook) se oculta por espacio,
              y el formulario quedaba sin explicar QUÉ es ni QUÉ llega. Este bloque
              solo se ve en móvil y da ese contexto en tres líneas. */}
          <div className="modal-intro">
            <div className="mi-tag">Regalo de bienvenida · Gratis</div>
            <p>
              Analizamos tus redes y tu web y te mandamos un <strong>informe con
              tus puntos débiles, tus oportunidades y un plan</strong> — a tu correo
              y WhatsApp, en menos de 24 horas.
            </p>
          </div>

          <LeadForm
            kind="analisis"
            /* "1 minuto" = lo que toma LLENARLO. La promesa de entrega es una
               sola en todo el sitio: menos de 24 horas. */
            subtitle="Análisis gratis · llenarlo toma 1 minuto"
            title={
              <>
                ¿A dónde te <em>mandamos</em> el informe?
              </>
            }
            submitLabel="Quiero mi análisis"
            successTitle="¡Recibido!"
            successText="Tu informe llega al correo en unos minutos. No es un texto genérico: cruzamos tu cuenta con nuestra base de análisis de marcas de tu sector."
            legal
            fields={[
              { name: "name", label: "Nombre", required: true, placeholder: "Tu nombre" },
              { name: "company", label: "Empresa / marca", required: true, placeholder: "Nombre de tu marca" },
              { name: "email", label: "Email", type: "email", required: true, full: true, placeholder: "tu@correo.com" },
              { name: "phone", label: "WhatsApp", type: "tel", required: true, full: true, prefix: "+57", placeholder: "300 000 0000" },
              { name: "social", label: "Instagram", required: true, full: true, placeholder: "@tumarca (o el link)" },
              { name: "tiktok", label: "TikTok", full: true, optionalHint: "si tienes", placeholder: "@tumarca en TikTok" },
              { name: "web", label: "Sitio web", full: true, optionalHint: "si tienes", placeholder: "www.tumarca.com" },
              {
                name: "project",
                label: "¿Qué buscas?",
                as: "select",
                full: true,
                placeholder: "Elige (opcional)",
                options: [
                  "Manejo de redes",
                  "UGC / creadores",
                  "Un videoclip",
                  "Un comercial / campaña",
                  "Cobertura de evento",
                  "Fotografía",
                  "Aún no sé",
                ],
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
