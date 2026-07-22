"use client";

import { useState } from "react";
import type { LeadKind } from "@/lib/leads";

export interface LeadField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  prefix?: string; // p.ej. "+57"
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
      payload[f.name] = (fd.get(f.name) as string) || "";
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
          <span className="prefix">{f.prefix}</span>
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
