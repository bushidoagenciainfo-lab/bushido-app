"use client";

import { useState } from "react";
import { LEAD_STATUSES, type LeadRow } from "@/lib/admin-types";

function fecha(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) +
    " " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminLeads({ leads }: { leads: LeadRow[] }) {
  const [rows, setRows] = useState(leads);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, { url?: string; error?: string }>>({});

  async function cambiarEstado(id: string, status: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/lead-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  async function generar(lead: LeadRow) {
    setBusy(lead.id);
    setResult((r) => ({ ...r, [lead.id]: {} }));
    try {
      const res = await fetch("/api/admin/analizar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          marca: lead.company || lead.name || "Marca",
          redes: lead.social,
          tiktok: lead.tiktok,
          web: lead.web,
          contexto: [lead.project, lead.message].filter(Boolean).join(" · "),
          email: lead.email,
          nombre: lead.name,
          phone: lead.phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) setResult((r) => ({ ...r, [lead.id]: { url: data.url } }));
      else setResult((r) => ({ ...r, [lead.id]: { error: data.error || "Falló." } }));
    } catch {
      setResult((r) => ({ ...r, [lead.id]: { error: "Error de red." } }));
    } finally {
      setBusy(null);
    }
  }

  if (!rows.length) return <p className="admin-empty">Aún no hay leads.</p>;

  return (
    <div className="admin-leads">
      {rows.map((l) => {
        const res = result[l.id];
        return (
          <div className="admin-lead" key={l.id}>
            <div className="al-meta">
              <span className={"al-kind k-" + l.kind}>{l.kind}</span>
              <span className="al-date">{fecha(l.created_at)}</span>
            </div>
            <div className="al-main">
              <strong>{l.name || "—"}</strong>
              {l.company ? <span className="al-company"> · {l.company}</span> : null}
              <div className="al-contact">
                {l.email ? <a href={`mailto:${l.email}`}>{l.email}</a> : null}
                {l.phone ? <span> · {l.phone}</span> : null}
                {l.social ? <span> · {l.social}</span> : null}
              </div>
              {l.project ? <div className="al-project">{l.project}</div> : null}
              {l.message ? <div className="al-msg">“{l.message}”</div> : null}
            </div>
            <div className="al-actions">
              <select
                value={l.status}
                onChange={(e) => cambiarEstado(l.id, e.target.value)}
                className={"al-status s-" + l.status}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="al-gen"
                onClick={() => generar(l)}
                disabled={busy === l.id}
              >
                {busy === l.id ? "Analizando…" : "Generar análisis"}
              </button>
              {res?.url && (
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="al-link">
                  Ver informe →
                </a>
              )}
              {res?.error && <span className="al-err">{res.error}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
