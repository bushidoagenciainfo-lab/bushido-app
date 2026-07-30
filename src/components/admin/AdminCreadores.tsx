"use client";

import { useMemo, useState } from "react";
import { NICHOS_CREADOR, FORMATOS_CREADOR } from "@/lib/creadores-taxonomia";

export interface CreadorLite {
  id: string;
  nombre: string;
  ciudad?: string | null;
  telefono?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  nichos?: string[] | null;
  formatos?: string[] | null;
  seguidores?: number | null;
  tarifa?: string | null;
  estado: string;
  notas?: string | null;
}

const ESTADOS = ["nuevo", "aprobado", "destacado", "pausado"];

/** Book de creadores en el panel: filtra por ciudad, nicho y formato para armar castings. */
export default function AdminCreadores({ creadores }: { creadores: CreadorLite[] }) {
  const [rows, setRows] = useState(creadores);
  const [ciudad, setCiudad] = useState("");
  const [nicho, setNicho] = useState("");
  const [formato, setFormato] = useState("");
  const [q, setQ] = useState("");

  const ciudades = useMemo(
    () => [...new Set(creadores.map((c) => c.ciudad).filter(Boolean))] as string[],
    [creadores]
  );

  const filtrados = rows.filter((c) => {
    if (ciudad && c.ciudad !== ciudad) return false;
    if (nicho && !(c.nichos ?? []).includes(nicho)) return false;
    if (formato && !(c.formatos ?? []).includes(formato)) return false;
    if (q) {
      const t = `${c.nombre} ${c.instagram ?? ""} ${c.tiktok ?? ""}`.toLowerCase();
      if (!t.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function cambiarEstado(id: string, estado: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, estado } : r)));
    await fetch("/api/admin/creador-estado", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, estado }),
    }).catch(() => {});
  }

  if (!creadores.length) {
    return <p className="admin-empty">El book está vacío. Importa creadores o comparte /gremio#creadores.</p>;
  }

  return (
    <div className="admin-book">
      <div className="book-filtros">
        <input
          className="book-search"
          placeholder="Buscar por nombre o @usuario…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={nicho} onChange={(e) => setNicho(e.target.value)}>
          <option value="">Todos los nichos</option>
          {NICHOS_CREADOR.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <select value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="">Todos los formatos</option>
          {FORMATOS_CREADOR.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <span className="book-count">{filtrados.length}</span>
      </div>

      <div className="book-grid">
        {filtrados.map((c) => (
          <div className={"book-card e-" + c.estado} key={c.id}>
            <div className="bc-top">
              <strong>{c.nombre}</strong>
              {c.ciudad && <span className="bc-city">{c.ciudad}</span>}
            </div>
            <div className="bc-social">
              {c.instagram && (
                <a
                  href={`https://instagram.com/${c.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IG {c.instagram}
                </a>
              )}
              {c.tiktok && (
                <a
                  href={`https://tiktok.com/@${c.tiktok.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TT {c.tiktok}
                </a>
              )}
            </div>
            {c.telefono && (
              <a className="bc-wa" href={`https://wa.me/57${c.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                WhatsApp {c.telefono}
              </a>
            )}
            {(c.nichos?.length || c.formatos?.length) && (
              <div className="bc-tags">
                {(c.nichos ?? []).map((n) => (
                  <span key={n} className="bc-tag n">{n}</span>
                ))}
                {(c.formatos ?? []).map((f) => (
                  <span key={f} className="bc-tag f">{f}</span>
                ))}
              </div>
            )}
            {c.notas && <p className="bc-notas">{c.notas}</p>}
            <div className="bc-foot">
              {c.seguidores ? <span className="bc-seg">{c.seguidores.toLocaleString("es-CO")} seg.</span> : null}
              {c.tarifa ? <span className="bc-seg">{c.tarifa}</span> : null}
              <select
                className={"bc-estado s-" + c.estado}
                value={c.estado}
                onChange={(e) => cambiarEstado(c.id, e.target.value)}
              >
                {ESTADOS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
