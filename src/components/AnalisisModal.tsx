"use client";

import { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { ANALISIS_EVENT } from "@/lib/ui";

const SHOWN_KEY = "bushido_modal_shown_v2";

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
      auto = !localStorage.getItem(SHOWN_KEY);
    } catch {}
    const t = auto
      ? window.setTimeout(() => {
          if (!document.body.classList.contains("modal-open")) setOpen(true);
        }, 14000)
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
        localStorage.setItem(SHOWN_KEY, "1");
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
          <LeadForm
            kind="analisis"
            subtitle="Pide tu análisis · 40 segundos"
            title={
              <>
                ¿A dónde te <em>mandamos</em> el informe?
              </>
            }
            submitLabel="Quiero mi análisis"
            successTitle="¡Recibido!"
            successText="Estamos preparando tu diagnóstico — te llega a tu correo y WhatsApp en menos de 24 horas."
            legal
            fields={[
              { name: "name", label: "Nombre", required: true, placeholder: "Tu nombre" },
              { name: "company", label: "Empresa / marca", required: true, placeholder: "Nombre de tu marca" },
              { name: "email", label: "Email", type: "email", required: true, placeholder: "tu@correo.com" },
              { name: "phone", label: "WhatsApp", type: "tel", required: true, prefix: "+57", placeholder: "300 000 0000" },
              { name: "social", label: "Instagram / redes", required: true, full: true, placeholder: "@tumarca (o el link)" },
              { name: "web", label: "Sitio web", full: true, optionalHint: "si tienes", placeholder: "www.tumarca.com" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
