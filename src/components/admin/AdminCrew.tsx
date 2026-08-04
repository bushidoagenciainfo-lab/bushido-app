"use client";

import { useMemo, useState } from "react";
import type { LeadRow } from "@/lib/admin-types";

/** Los links vienen concatenados con " · " desde /api/talent. */
function links(l: LeadRow): Array<{ label: string; url: string }> {
  const out: Array<{ label: string; url: string }> = [];
  const add = (label: string, v?: string | null) => {
    if (!v) return;
    for (const parte of String(v).split(" · ")) {
      const limpio = parte.replace(/^CV:\s*/i, "").trim();
      if (limpio) out.push({ label: parte.startsWith("CV:") ? "CV" : label, url: limpio });
    }
  };
  add("Portafolio", l.portfolio);
  add("Reel", l.reel);
  add("Behance", l.behance);
  add("Web", l.web);
  add("Link", l.links);
  return out;
}

const esUrl = (s: string) => /^(https?:)?\/\//i.test(s) || s.includes(".");

/** Banco de crew: quienes se postulan para trabajar en producción. */
export default function AdminCrew({ crew }: { crew: LeadRow[] }) {
  const [rol, setRol] = useState("");
  const [q, setQ] = useState("");

  const roles = useMemo(
    () => [...new Set(crew.map((c) => c.role).filter(Boolean))] as string[],
    [crew]
  );

  const filtrados = crew.filter((c) => {
    if (rol && c.role !== rol) return false;
    if (q) {
      const t = `${c.name ?? ""} ${c.email ?? ""} ${c.role ?? ""}`.toLowerCase();
      if (!t.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  if (!crew.length) {
    return (
      <p className="admin-empty">
        Nadie se ha postulado como crew todavía. El formulario está en{" "}
        <a href="/gremio#talento" target="_blank" rel="noopener noreferrer">
          /gremio
        </a>{" "}
        → opción “Crew”.
      </p>
    );
  }

  return (
    <div className="admin-book">
      <div className="book-filtros">
        <input
          className="book-search"
          placeholder="Buscar por nombre, correo o rol…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <span className="book-count">{filtrados.length}</span>
      </div>

      <div className="book-grid">
        {filtrados.map((c) => (
          <div className="book-card" key={c.id}>
            <div className="bc-top">
              <div className="bc-id">
                <strong>{c.name || "—"}</strong>
                {c.created_at && (
                  <span className="bc-city">
                    {new Date(c.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
              {c.role && <span className="crew-rol">{c.role}</span>}
            </div>

            <div className="bc-social">
              {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
            </div>
            {c.phone && (
              <a
                className="bc-wa"
                href={`https://wa.me/57${String(c.phone).replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {c.phone}
              </a>
            )}

            {links(c).length > 0 && (
              <div className="crew-links">
                {links(c).map((l, k) => (
                  <a
                    key={k}
                    href={esUrl(l.url) ? (l.url.startsWith("http") ? l.url : `https://${l.url}`) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={"crew-link" + (l.label === "CV" ? " cv" : "")}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
