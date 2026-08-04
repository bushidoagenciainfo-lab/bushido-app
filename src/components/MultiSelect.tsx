"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desplegable de selección múltiple (nicho, formatos…).
 * Reemplaza a las grillas de chips: ocupa una línea y se abre al tocarlo.
 */
export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecciona…",
  required,
  hint,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fuera = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const resumen =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(" · ")
        : `${value.slice(0, 2).join(" · ")} +${value.length - 2}`;

  return (
    <div className="field ms" ref={box}>
      <label>
        {label} {required && <span className="req">*</span>}
        {hint && (
          <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}> {hint}</span>
        )}
      </label>

      <button
        type="button"
        className={"ms-trigger" + (open ? " open" : "") + (value.length ? " filled" : "")}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{resumen}</span>
        <span className="ms-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="ms-panel" role="listbox" aria-multiselectable="true">
          {options.map((o) => {
            const on = value.includes(o);
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={on}
                className={"ms-opt" + (on ? " on" : "")}
                onClick={() => toggle(o)}
              >
                <span className="ms-box" aria-hidden="true">
                  {on ? "✓" : ""}
                </span>
                {o}
              </button>
            );
          })}
          <div className="ms-foot">
            <span>{value.length} seleccionado{value.length === 1 ? "" : "s"}</span>
            <button type="button" onClick={() => setOpen(false)}>
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
