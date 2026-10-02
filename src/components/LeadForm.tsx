"use client";

import { useState } from "react";
import Link from "next/link";
import type { LeadKind } from "@/lib/leads";
import { waUrl } from "@/lib/site";
import { track } from "@/lib/track";

/** Indicativos para el selector del teléfono. Colombia primero, luego el resto. */
const INDICATIVOS = [
  { pais: "Colombia", cod: "+57" },
  { pais: "México", cod: "+52" },
  { pais: "Estados Unidos", cod: "+1" },
  { pais: "España", cod: "+34" },
  { pais: "Argentina", cod: "+54" },
  { pais: "Chile", cod: "+56" },
  { pais: "Perú", cod: "+51" },
  { pais: "Ecuador", cod: "+593" },
  { pais: "Venezuela", cod: "+58" },
  { pais: "Panamá", cod: "+507" },
  { pais: "Costa Rica", cod: "+506" },
  { pais: "Guatemala", cod: "+502" },
  { pais: "Rep. Dominicana", cod: "+1809" },
  { pais: "Brasil", cod: "+55" },
  { pais: "Uruguay", cod: "+598" },
  { pais: "Paraguay", cod: "+595" },
  { pais: "Bolivia", cod: "+591" },
  { pais: "Puerto Rico", cod: "+1787" },
  { pais: "Italia", cod: "+39" },
  { pais: "Reino Unido", cod: "+44" },
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
  /** Valores iniciales (p.ej. servicio preseleccionado desde el drawer). */
  defaults?: Record<string, string>;
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
  defaults,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [prefixCodes, setPrefixCodes] = useState<Record<string, string>>({});
  // El selector de país aparece solo si la persona lo pide ("¿Otro país?").
  const [otroPais, setOtroPais] = useState<Record<string, boolean>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload: Record<string, string> = { kind };

    // Validación en cliente: lo justo para no mandar basura al servidor.
    for (const f of fields) {
      const v = ((fd.get(f.name) as string) || "").trim();
      if (f.required && !v) {
        setError(`Falta ${f.label.toLowerCase()}.`);
        setStatus("error");
        form.querySelector<HTMLElement>(`[name="${f.name}"]`)?.focus();
        return;
      }
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        setError("Revisa el correo: parece incompleto.");
        setStatus("error");
        return;
      }
      if (f.prefix && v) {
        const digitos = v.replace(/\D/g, "");
        if (digitos.length < 7 || digitos.length > 15) {
          setError("Revisa el WhatsApp: debe tener entre 7 y 15 dígitos.");
          setStatus("error");
          return;
        }
      }
    }

    setStatus("loading");
    fields.forEach((f) => {
      let v = (fd.get(f.name) as string) || "";
      // El teléfono se guarda SIEMPRE con indicativo de país (el que eligió en
      // el selector), para que funcione con clientes de fuera de Colombia.
      if (f.prefix && v) {
        const ind = ((fd.get(`${f.name}_ind`) as string) || prefixCodes[f.name] || f.prefix).replace(/\D/g, "");
        v = v.replace(/\D/g, "");
        while (ind && v.startsWith(ind + ind)) v = v.slice(ind.length);
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
      track("conversion", kind, payload.project ? { project: payload.project } : undefined);
      setStatus("done");
      form.reset();
    } catch {
      setError("Error de conexión. Revisa tu internet e intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "done") {
    const waMsg =
      kind === "analisis"
        ? "Hola Bushido, acabo de pedir el análisis gratis en la web y quiero adelantar la conversación."
        : "Hola Bushido, acabo de enviar el formulario en la web y quiero adelantar la conversación.";
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
          <div className="fs-actions">
            <a
              className="btn btn-primary"
              href={waUrl(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta", "whatsapp", { origen: "exito-" + kind })}
            >
              ¿Hablamos ya? WhatsApp <span className="arrow">↗</span>
            </a>
            <Link className="btn btn-ghost" href="/portafolio">
              Ver el trabajo <span className="arrow">→</span>
            </Link>
          </div>
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

  const def = (name: string) => defaults?.[name];

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
        <select
          id={`f-${f.name}`}
          name={f.name}
          required={f.required}
          defaultValue={def(f.name) && f.options?.includes(def(f.name)!) ? def(f.name) : ""}
        >
          <option value="" disabled>
            {f.placeholder || "Selecciona uno"}
          </option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : f.as === "textarea" ? (
        <textarea id={`f-${f.name}`} name={f.name} placeholder={f.placeholder} rows={3} defaultValue={def(f.name)} />
      ) : f.prefix ? (
        <>
          <div className="prefix-wrap">
            <div className="prefix-display">
              <span>{prefixCodes[f.name] || f.prefix}</span>
              {otroPais[f.name] && (
                <>
                  <svg className="prefix-chev" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4"/></svg>
                  <select
                    className="prefix-over"
                    name={`${f.name}_ind`}
                    value={prefixCodes[f.name] || f.prefix}
                    onChange={(e) => setPrefixCodes((c) => ({ ...c, [f.name]: e.target.value }))}
                    aria-label="País"
                  >
                    {INDICATIVOS.map((p) => (
                      <option key={p.cod + p.pais} value={p.cod}>
                        {p.cod} · {p.pais}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <input
              id={`f-${f.name}`}
              name={f.name}
              type={f.type || "text"}
              inputMode="numeric"
              autoComplete="tel-national"
              enterKeyHint="next"
              placeholder={f.placeholder}
              required={f.required}
              defaultValue={def(f.name)}
            />
          </div>
          {!otroPais[f.name] && (
            <button
              type="button"
              className="prefix-otro"
              onClick={() => setOtroPais((o) => ({ ...o, [f.name]: true }))}
            >
              ¿Otro país?
            </button>
          )}
        </>
      ) : (
        <input
          id={`f-${f.name}`}
          name={f.name}
          type={f.type || "text"}
          placeholder={f.placeholder}
          required={f.required}
          defaultValue={def(f.name)}
          autoComplete={f.type === "email" ? "email" : f.name === "name" ? "name" : undefined}
          enterKeyHint="next"
        />
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
          <div className="field-error" role="alert">{error}</div>
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
