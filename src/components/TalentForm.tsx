"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

export default function TalentForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    try {
      const res = await fetch("/api/talent", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No pudimos enviar tu postulación.");
        setStatus("error");
        return;
      }
      setStatus("done");
      form.reset();
      setFileName("");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="form-card">
        <div className="form-success" style={{ display: "block" }}>
          <div className="check">
            <svg viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4>¡Recibido!</h4>
          <p>Quedaste en el banco de talentos. Te escribimos cuando salga un proyecto para tu perfil.</p>
          <button type="button" className="again" onClick={() => setStatus("idle")}>
            Enviar otra postulación
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="form-content">
        <div className="form-sub">Formulario · postulación</div>
        <h3>
          Únete al <em>gremio</em>.
        </h3>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-name">
              Nombre <span className="req">*</span>
            </label>
            <input id="t-name" name="name" type="text" placeholder="Tu nombre" required />
          </div>
          <div className="field">
            <label htmlFor="t-email">
              Email <span className="req">*</span>
            </label>
            <input id="t-email" name="email" type="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-phone">WhatsApp</label>
            <div className="prefix-wrap">
              <span className="prefix">+57</span>
              <input id="t-phone" name="phone" type="tel" inputMode="numeric" placeholder="300 000 0000" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="t-role">
              Tu rol <span className="req">*</span>
            </label>
            <select id="t-role" name="role" required defaultValue="">
              <option value="" disabled>
                Selecciona uno
              </option>
              <option>Fotógrafo / Cámara</option>
              <option>Editor</option>
              <option>Colorista</option>
              <option>Sonidista</option>
              <option>Productor</option>
              <option>Director / DP</option>
              <option>Diseñador / Motion</option>
              <option>Otro</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="t-cv">
            Adjunta tu CV{" "}
            <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>
              (PDF, DOC o DOCX · máx 8MB)
            </span>
          </label>
          <label htmlFor="t-cv" className="file-drop">
            <span>{fileName || "Elegir archivo…"}</span>
            <span className="file-btn">Subir</span>
          </label>
          <input
            id="t-cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-portfolio">Portafolio</label>
            <input id="t-portfolio" name="portfolio" type="text" placeholder="Drive, web, IG…" />
          </div>
          <div className="field">
            <label htmlFor="t-reel">Reel</label>
            <input id="t-reel" name="reel" type="text" placeholder="Link de tu reel" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="t-behance">Behance</label>
            <input id="t-behance" name="behance" type="text" placeholder="behance.net/tu" />
          </div>
          <div className="field">
            <label htmlFor="t-web">Sitio web</label>
            <input id="t-web" name="web" type="text" placeholder="www.tuweb.com" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="t-links">Otros links</label>
          <input id="t-links" name="links" type="text" placeholder="Cualquier otro enlace relevante" />
        </div>

        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

        {status === "error" && (
          <div style={{ color: "var(--sepp)", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Enviando…" : "Enviar postulación"}
            <span className="arrow">→</span>
          </button>
        </div>

        <p className="legal-note">
          Al enviar aceptas nuestra{" "}
          <a href="/politica-datos">política de tratamiento de datos personales</a>.
          Guardamos tu perfil para futuros proyectos.
        </p>
      </div>
    </form>
  );
}
