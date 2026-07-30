"use client";

import { useState } from "react";
import { NICHOS_CREADOR, FORMATOS_CREADOR } from "@/lib/creadores-taxonomia";

type Status = "idle" | "loading" | "done" | "error";

/** Registro al book de creadores UGC / influencers de Bushido. */
export default function CreatorForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [nichos, setNichos] = useState<string[]>([]);
  const [formatos, setFormatos] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: (fd.get("nombre") as string) || "",
      email: (fd.get("email") as string) || "",
      telefono: (fd.get("telefono") as string) || "",
      ciudad: (fd.get("ciudad") as string) || "",
      instagram: (fd.get("instagram") as string) || "",
      tiktok: (fd.get("tiktok") as string) || "",
      seguidores: (fd.get("seguidores") as string) || undefined,
      tarifa: (fd.get("tarifa") as string) || "",
      portafolio: (fd.get("portafolio") as string) || "",
      notas: (fd.get("notas") as string) || "",
      website_hp: (fd.get("website_hp") as string) || "",
      nichos,
      formatos,
    };
    try {
      const res = await fetch("/api/creador", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No pudimos registrar tu perfil.");
        setStatus("error");
        return;
      }
      setStatus("done");
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
          <h4>¡Estás en el book!</h4>
          <p>
            Te escribimos cuando tengamos un brief que encaje con tu perfil y tu nicho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="form-content">
        <div className="form-sub">Book de creadores · UGC</div>
        <h3>
          Trabaja con <em>Bushido</em>.
        </h3>

        <div className="form-row">
          <div className="field">
            <label htmlFor="c-nombre">Nombre <span className="req">*</span></label>
            <input id="c-nombre" name="nombre" required placeholder="Tu nombre" />
          </div>
          <div className="field">
            <label htmlFor="c-ciudad">Ciudad</label>
            <input id="c-ciudad" name="ciudad" placeholder="Bogotá" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="c-email">Email <span className="req">*</span></label>
            <input id="c-email" name="email" type="email" required placeholder="tu@correo.com" />
          </div>
          <div className="field">
            <label htmlFor="c-tel">WhatsApp</label>
            <input id="c-tel" name="telefono" type="tel" inputMode="numeric" placeholder="300 000 0000" />
          </div>
        </div>

        <div className="field">
          <label>Tu nicho <span className="req">*</span></label>
          <div className="chip-group">
            {NICHOS_CREADOR.map((n) => (
              <button
                key={n}
                type="button"
                className={"chip" + (nichos.includes(n) ? " on" : "")}
                onClick={() => toggle(nichos, setNichos, n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Qué sabes hacer</label>
          <div className="chip-group">
            {FORMATOS_CREADOR.map((f) => (
              <button
                key={f}
                type="button"
                className={"chip" + (formatos.includes(f) ? " on" : "")}
                onClick={() => toggle(formatos, setFormatos, f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="c-ig">Instagram</label>
            <input id="c-ig" name="instagram" placeholder="@tuusuario" />
          </div>
          <div className="field">
            <label htmlFor="c-tt">TikTok</label>
            <input id="c-tt" name="tiktok" placeholder="@tuusuario" />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="c-seg">Seguidores <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>(tu red principal)</span></label>
            <input id="c-seg" name="seguidores" type="number" inputMode="numeric" placeholder="5000" min={0} />
          </div>
          <div className="field">
            <label htmlFor="c-tarifa">Tu tarifa por pieza</label>
            <input id="c-tarifa" name="tarifa" placeholder="Ej: $150.000" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="c-port">Ejemplos de tu trabajo</label>
          <input id="c-port" name="portafolio" placeholder="Link a Drive, carpeta o tu mejor video" />
        </div>

        <div className="field">
          <label htmlFor="c-notas">Algo más que debamos saber</label>
          <textarea id="c-notas" name="notas" rows={3} placeholder="Marcas con las que has trabajado, equipos que tienes, disponibilidad…" />
        </div>

        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

        {status === "error" && (
          <div style={{ color: "var(--sepp)", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Enviando…" : "Entrar al book"}
            <span className="arrow">→</span>
          </button>
        </div>
        <p className="legal-note">
          Al enviar aceptas nuestra <a href="/politica-datos">política de tratamiento de datos</a>.
        </p>
      </div>
    </form>
  );
}
