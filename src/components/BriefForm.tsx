"use client";

import { useRef, useState } from "react";
import { BRIEF, briefATexto } from "@/lib/brief";
import { WHATSAPP, EMAIL } from "@/lib/site";

type Estado = "idle" | "enviando" | "listo" | "error";

/**
 * Brief de onboarding. El cliente invierte 15 minutos aquí, así que si el envío
 * falla NUNCA se pierde: queda el respaldo por correo, por WhatsApp y el botón
 * de copiar.
 */
export default function BriefForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  /** Lee el formulario tal como está ahora mismo. */
  function leer(): Record<string, string> {
    const fd = new FormData(formRef.current!);
    const datos: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string" && v.trim()) datos[k] = v.trim();
    }
    return datos;
  }

  function abrirCorreo(datos: Record<string, string>) {
    const asunto = `Brief de marca · ${datos.nombre || "sin nombre"}`;
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(briefATexto(datos))}`;
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = leer();
    if (!datos.nombre) {
      setError("Necesitamos al menos el nombre del negocio.");
      setEstado("error");
      document.getElementById("b-nombre")?.focus();
      return;
    }
    setEstado("enviando");
    setError("");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(datos),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.error || "No se pudo enviar.");
      setEstado("listo");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
      setEstado("error");
      // el trabajo del cliente no se pierde: abrimos el correo con todo escrito
      abrirCorreo(datos);
    }
  }

  function porWhatsApp() {
    const datos = leer();
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(briefATexto(datos))}`,
      "_blank",
      "noopener"
    );
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(briefATexto(leer()));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setError("Tu navegador no dejó copiar. Usa el correo o WhatsApp.");
      setEstado("error");
    }
  }

  if (estado === "listo") {
    return (
      <div className="brief-ok">
        <div className="bo-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2>Recibido.</h2>
        <p>Ya lo tenemos y empezamos a trabajar con esta información.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={enviar} noValidate className="brief-form">
      {BRIEF.map((sec) => (
        <section className="bf-sec" key={sec.num}>
          <header className="bf-sec-head">
            <span className="bf-num">
              {sec.num} <i>/ 08</i>
            </span>
            <h2>{sec.titulo}</h2>
            {sec.descripcion && <p className="bf-sec-desc">{sec.descripcion}</p>}
          </header>

          <div className="bf-campos">
            {sec.campos.map((c) => (
              <div className={"bf-campo" + (c.tipo === "area" ? " ancho" : "")} key={c.clave}>
                <label htmlFor={`b-${c.clave}`}>
                  {c.label}
                  {c.requerido && <span className="bf-req"> *</span>}
                </label>

                {c.tipo === "select" ? (
                  <select id={`b-${c.clave}`} name={c.clave} defaultValue="">
                    <option value="">Selecciona…</option>
                    {c.opciones?.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : c.tipo === "area" ? (
                  <textarea id={`b-${c.clave}`} name={c.clave} rows={4} placeholder={c.placeholder} />
                ) : (
                  <input id={`b-${c.clave}`} name={c.clave} type="text" placeholder={c.placeholder} />
                )}

                {c.hint && <small className="bf-hint">{c.hint}</small>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

      {estado === "error" && (
        <div className="bf-error">
          <strong>{error}</strong>
          <span>
            Tus respuestas no se perdieron: abrimos tu correo con todo escrito. También
            puedes mandarlas por WhatsApp o copiarlas con los botones de abajo.
          </span>
        </div>
      )}

      <div className="bf-acciones">
        <button type="submit" className="btn btn-primary" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar brief"} <span className="arrow">→</span>
        </button>
        <button type="button" className="btn btn-ghost" onClick={porWhatsApp}>
          Enviar por WhatsApp
        </button>
        <button type="button" className="btn btn-ghost" onClick={copiar}>
          {copiado ? "Copiado ✓" : "Copiar respuestas"}
        </button>
      </div>
    </form>
  );
}
