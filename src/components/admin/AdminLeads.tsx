"use client";

import { useState } from "react";
import { LEAD_STATUSES, type LeadRow } from "@/lib/admin-types";

function fecha(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) +
    " " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

/** Respuesta de POST /api/sitio/matching (Creator Matching del cerebro). */
interface MatchResultado {
  lectura?: string;
  error?: string;
  matches?: Array<{
    creador?: { nombre?: string; instagram?: string; seguidores?: number };
    encaje?: string;
    por_que?: string;
    como_usarlo?: string;
    riesgo?: string;
    confianza?: string;
  }>;
}

/** Resultado del informe automático, guardado en lead.meta.informe. */
function infoInforme(l: LeadRow): { ok: boolean; url?: string; error?: string } | null {
  const meta = l.meta as Record<string, unknown> | undefined;
  const i = meta?.informe as { ok?: boolean; url?: string; error?: string } | undefined;
  if (!i || typeof i.ok !== "boolean") return null;
  return { ok: i.ok, url: i.url, error: i.error };
}

export default function AdminLeads({ leads }: { leads: LeadRow[] }) {
  const [rows, setRows] = useState(leads);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<
    Record<string, { url?: string; error?: string; envio?: string }>
  >({});
  const [match, setMatch] = useState<Record<string, MatchResultado>>({});

  /** Le pregunta al cerebro qué creadores del book encajan con esta marca. */
  async function buscarCreadores(lead: LeadRow) {
    setBusy(lead.id);
    setMatch((m) => ({ ...m, [lead.id]: { lectura: "Consultando el book…" } }));
    try {
      const res = await fetch("/api/admin/os", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          marca: lead.company || lead.name,
          categoria: (lead.meta as Record<string, unknown> | undefined)?.categoria,
          ciudad: undefined,
        }),
      });
      const d = await res.json();
      setMatch((m) => ({
        ...m,
        [lead.id]:
          res.ok && d.ok
            ? (d.data as MatchResultado)
            : { error: d.error || "El cerebro no respondió." },
      }));
    } catch {
      setMatch((m) => ({ ...m, [lead.id]: { error: "Error de red." } }));
    } finally {
      setBusy(null);
    }
  }

  async function cambiarEstado(id: string, status: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/lead-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  /**
   * `enviarCliente` en false = solo genera el informe (para revisarlo).
   * En true = además se lo manda al cliente por correo y WhatsApp.
   */
  async function generar(lead: LeadRow, profundo = false, enviarCliente = false) {
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
          profundo,
          enviarCliente,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        const e = data.envio as { correo?: string; whatsapp?: string } | undefined;
        setResult((r) => ({
          ...r,
          [lead.id]: {
            url: data.url,
            envio: e ? `Correo: ${e.correo ?? "—"} · WhatsApp: ${e.whatsapp ?? "—"}` : undefined,
          },
        }));
      } else setResult((r) => ({ ...r, [lead.id]: { error: data.error || "Falló." } }));
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
              {/* Qué pasó con el informe automático (antes solo se veía en los logs) */}
              {infoInforme(l) && (
                <div className={"al-informe" + (infoInforme(l)!.ok ? " ok" : " bad")}>
                  {infoInforme(l)!.ok ? (
                    <>
                      Informe enviado{" "}
                      {infoInforme(l)!.url && (
                        <a href={infoInforme(l)!.url} target="_blank" rel="noopener noreferrer">
                          ver →
                        </a>
                      )}
                    </>
                  ) : (
                    <>No se generó: {infoInforme(l)!.error || "motivo desconocido"}</>
                  )}
                </div>
              )}
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
              <button
                type="button"
                className="al-gen al-gen-deep"
                onClick={() => generar(l, true)}
                disabled={busy === l.id}
                title="Busca la marca en la web antes de analizar. Tarda ~1 min más — para clientes que ya contrataron."
              >
                {busy === l.id ? "…" : "＋ Profundo (con web)"}
              </button>
              {res?.url && (
                <>
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="al-link">
                    Ver informe →
                  </a>
                  {/* Generar NO envía: primero lo revisas, luego lo mandas. */}
                  {!res.envio && (
                    <button
                      type="button"
                      className="al-gen al-gen-send"
                      onClick={() => generar(l, false, true)}
                      disabled={busy === l.id}
                      title="Le manda el informe al cliente por correo y WhatsApp"
                    >
                      Enviar al cliente ↗
                    </button>
                  )}
                </>
              )}
              {res?.envio && <span className="al-envio">{res.envio}</span>}
              {res?.error && <span className="al-err">{res.error}</span>}

              {/* Creator Matching: qué creadores del book encajan con esta marca */}
              <button
                type="button"
                className="al-gen al-gen-match"
                onClick={() => buscarCreadores(l)}
                disabled={busy === l.id}
                title="Le pregunta al cerebro qué creadores del book encajan"
              >
                ✦ Creadores que encajan
              </button>
              {match[l.id] && (
                <div className="al-match">
                  {match[l.id].error ? (
                    <span className="al-err">{match[l.id].error}</span>
                  ) : (
                    <>
                      {match[l.id].lectura && <p className="am-lectura">{match[l.id].lectura}</p>}
                      {match[l.id].matches?.map((m, k) => (
                        <div className="am-fila" key={k}>
                          <strong>{m.creador?.nombre ?? "—"}</strong>
                          <span className="am-encaje">{m.encaje}</span>
                          <p>{m.por_que}</p>
                          {m.como_usarlo && <p className="am-como">{m.como_usarlo}</p>}
                          {m.riesgo && <p className="am-riesgo">⚠ {m.riesgo}</p>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
