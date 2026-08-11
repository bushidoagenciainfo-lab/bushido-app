"use client";

import { useState } from "react";
import type { LeadKind } from "@/lib/leads";

/** Indicativos para el selector del teléfono. Colombia primero, luego el resto. */
const INDICATIVOS = [
  { pais: "Colombia", cod: "+57", bandera: "🇨🇴" },
  { pais: "México", cod: "+52", bandera: "🇲🇽" },
  { pais: "Estados Unidos", cod: "+1", bandera: "🇺🇸" },
  { pais: "España", cod: "+34", bandera: "🇪🇸" },
  { pais: "Argentina", cod: "+54", bandera: "🇦🇷" },
  { pais: "Chile", cod: "+56", bandera: "🇨🇱" },
  { pais: "Perú", cod: "+51", bandera: "🇵🇪" },
  { pais: "Ecuador", cod: "+593", bandera: "🇪🇨" },
  { pais: "Venezuela", cod: "+58", bandera: "🇻🇪" },
  { pais: "Panamá", cod: "+507", bandera: "🇵🇦" },
  { pais: "Costa Rica", cod: "+506", bandera: "🇨🇷" },
  { pais: "Guatemala", cod: "+502", bandera: "🇬🇹" },
  { pais: "Rep. Dominicana", cod: "+1809", bandera: "🇩🇴" },
  { pais: "Brasil", cod: "+55", bandera: "🇧🇷" },
  { pais: "Uruguay", cod: "+598", bandera: "🇺🇾" },
  { pais: "Paraguay", cod: "+595", bandera: "🇵🇾" },
  { pais: "Bolivia", cod: "+591", bandera: "🇧🇴" },
  { pais: "Puerto Rico", cod: "+1787", bandera: "🇵🇷" },
  { pais: "Italia", cod: "+39", bandera: "🇮🇹" },
  { pais: "Reino Unido", cod: "+44", bandera: "🇬🇧" },
] as const;

export interface LeadField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  prefix?: string; // indicativo por defecto del selector de país, p.ej. "+57"
  full?: boolean; // ocupa toda la fila
  as?: "input" | "select" | "textarea";
  options?: string[];
  optionalHint?: string;
}

interface Props {
  kind: LeadKind;
  fields: LeadField[];
  subtitle: string;
  title: React.ReactNode;
  submitLabel: string;
  successTitle: string;
  successText: string;
  legal?: boolean;
  compact?: boolean;
}

type Status = "idle" | "loading" | "done" | "error";

export default function LeadForm({
  kind,
  fields,
  subtitle,
  title,
  submitLabel,
  successTitle,
  successText,
  legal,
  compact,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload: Record<string, string> = { kind };
    fields.forEach((f) => {
      let v = (fd.get(f.name) as string) || "";
      // el campo ya muestra el prefijo (+57): si la persona lo escribe otra vez,
      // lo quitamos aquí para no guardar "+57 +57300..."
      // El teléfono se guarda SIEMPRE con indicativo de país (el que eligió en
      // el selector), para que funcione con clientes de fuera de Colombia.
      if (f.prefix && v) {
        const ind = ((fd.get(`${f.name}_ind`) as string) || f.prefix).replace(/\D/g, "");
        v = v.replace(/\D/g, "");
        while (ind && v.startsWith(ind + ind)) v = v.slice(ind.length);
        // si ya lo escribió con indicativo, no lo dupliques
        if (ind && v.startsWith(ind) && v.length > ind.length + 6) v = v.slice(ind.length);
        v = ind + v;
      }
      payload[f.name] = v;
    });
    payload.website_hp = (fd.get("website_hp") as string) || "";

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No pudimos enviar tu solicitud.");
        setStatus("error");
        return;
      }
      setStatus("done");
      form.reset();
    } catch {
      setError("Error de conexión. Revisa tu internet e intenta de nuevo.");
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
          <h4>{successTitle}</h4>
          <p>{successText}</p>
          <button type="button" className="again" onClick={() => setStatus("idle")}>
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  // agrupa campos de a 2 (salvo full)
  const rows: LeadField[][] = [];
  let buffer: LeadField[] = [];
  for (const f of fields) {
    if (f.full) {
      if (buffer.length) { rows.push(buffer); buffer = []; }
      rows.push([f]);
    } else {
      buffer.push(f);
      if (buffer.length === 2) { rows.push(buffer); buffer = []; }
    }
  }
  if (buffer.length) rows.push(buffer);

  const renderField = (f: LeadField) => (
    <div className="field" key={f.name}>
      <label htmlFor={`f-${f.name}`}>
        {f.label}{" "}
        {f.required ? (
          <span className="req">*</span>
        ) : f.optionalHint ? (
          <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>
            ({f.optionalHint})
          </span>
        ) : null}
      </label>
      {f.as === "select" ? (
        <select id={`f-${f.name}`} name={f.name} required={f.required} defaultValue="">
          <option value="" disabled>
            {f.placeholder || "Selecciona uno"}
          </option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : f.as === "textarea" ? (
        <textarea id={`f-${f.name}`} name={f.name} placeholder={f.placeholder} rows={3} />
      ) : f.prefix ? (
        <div className="prefix-wrap">
          {/* Selector de país: antes el +57 era fijo y la gente de fuera de
              Colombia no podía dejar su número. */}
          <select className="prefix-sel" name={`${f.name}_ind`} defaultValue={f.prefix} aria-label="País">
            {INDICATIVOS.map((p) => (
              <option key={p.cod + p.pais} value={p.cod}>
                {p.bandera} {p.cod}
              </option>
            ))}
          </select>
          <input id={`f-${f.name}`} name={f.name} type={f.type || "text"} inputMode="numeric" placeholder={f.placeholder} required={f.required} />
        </div>
      ) : (
        <input id={`f-${f.name}`} name={f.name} type={f.type || "text"} placeholder={f.placeholder} required={f.required} />
      )}
    </div>
  );

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="form-content">
        <div className="form-sub">{subtitle}</div>
        <h3>{title}</h3>

        {rows.map((row, i) =>
          row.length === 2 ? (
            <div className="form-row" key={i}>
              {row.map(renderField)}
            </div>
          ) : (
            renderField(row[0])
          )
        )}

        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

        {status === "error" && (
          <div style={{ color: "var(--sepp)", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Enviando…" : submitLabel}
            <span className="arrow">→</span>
          </button>
        </div>

        {legal && (
          <p className="legal-note">
            Al enviar este formulario aceptas nuestra{" "}
            <a href="/politica-datos">política de tratamiento de datos personales</a>.
          </p>
        )}
        {!legal && !compact && (
          <div className="form-privacy">Sin spam. Solo te escribimos por tu proyecto.</div>
        )}
      </div>
    </form>
  );
}
