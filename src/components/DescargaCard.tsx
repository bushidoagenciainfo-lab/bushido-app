"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export interface Gift {
  tag: string;
  title: string;
  desc: string;
  file?: string; // ruta del archivo en /public, ej "/descargables/luts-bushido.zip"
}

/**
 * Tarjeta de descargable: pide el correo (queda como lead 'descarga') y entrega
 * el archivo. Ya NO abre el pop-up de análisis.
 */
export default function DescargaCard({ gift }: { gift: Gift }) {
  const [step, setStep] = useState<"idle" | "form" | "done">("idle");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    track("descarga", gift.title);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "descarga", email, pack: gift.title }),
      });
    } catch {
      /* no bloqueamos la descarga si el registro falla */
    }
    setBusy(false);
    setStep("done");
    if (gift.file) {
      // dispara la descarga
      window.location.href = gift.file;
    }
  }

  return (
    <div className="dl-card">
      <div className="dl-tag">{gift.tag}</div>
      <h4>{gift.title}</h4>
      <p>{gift.desc}</p>

      {step === "idle" && (
        <button type="button" className="dl-cta as-btn" onClick={() => setStep("form")}>
          Descargar gratis <span aria-hidden="true">↗</span>
        </button>
      )}

      {step === "form" && (
        <form className="dl-form" onSubmit={submit}>
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={busy}>
            {busy ? "…" : "Recibir"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="dl-done">
          {gift.file ? (
            <a href={gift.file} download className="dl-cta as-btn">
              Descargar ahora <span aria-hidden="true">↓</span>
            </a>
          ) : (
            <span>¡Listo! Te lo enviamos a tu correo pronto.</span>
          )}
        </div>
      )}
    </div>
  );
}
