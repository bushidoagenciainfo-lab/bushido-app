"use client";

import { useState } from "react";

/**
 * Sección plegable del panel: evita el "larguero" y deja ver solo lo que
 * interesa en el momento. La primera queda abierta por defecto.
 */
export default function AdminSection({
  title,
  count,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={"admin-acc" + (open ? " open" : "")}>
      <button type="button" className="admin-acc-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="aah-left">
          <h2>{title}</h2>
          {typeof count === "number" && <span className="admin-sec-count">{count}</span>}
        </div>
        <div className="aah-right">
          {hint && <span className="admin-sec-hint">{hint}</span>}
          <span className="aah-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && <div className="admin-acc-body">{children}</div>}
    </section>
  );
}
