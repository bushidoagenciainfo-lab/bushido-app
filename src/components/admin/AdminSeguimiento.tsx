"use client";

import { useMemo, useState } from "react";
import type { LeadRow } from "@/lib/admin-types";
import { WHATSAPP } from "@/lib/site";

/**
 * A quién hay que escribirle HOY.
 *
 * Los leads no se pierden por responder lento: se pierden porque al cuarto día
 * nadie volvió a escribir. Esto ordena por urgencia real y abre el WhatsApp
 * con el mensaje ya redactado.
 */

const DIAS = 86_400_000;

/** Cuántos días de silencio se aguantan según en qué punto va el lead. */
const LIMITE: Record<string, number> = {
  nuevo: 1,
  contactado: 3,
  propuesta: 5,
  ganado: 9999,
  perdido: 9999,
};

interface Pendiente {
  lead: LeadRow;
  dias: number;
  vencido: number; // días de más
  urgencia: "hoy" | "pronto" | "al-dia";
}

function analizar(leads: LeadRow[]): Pendiente[] {
  const ahora = Date.now();
  return leads
    .filter((l) => l.kind === "analisis" || l.kind === "contacto")
    .map((l) => {
      const dias = l.created_at ? Math.floor((ahora - new Date(l.created_at).getTime()) / DIAS) : 0;
      const limite = LIMITE[l.status ?? "nuevo"] ?? 1;
      const vencido = dias - limite;
      return {
        lead: l,
        dias,
        vencido,
        urgencia: vencido >= 2 ? "hoy" : vencido >= 0 ? "pronto" : "al-dia",
      } as Pendiente;
    })
    .filter((p) => p.urgencia !== "al-dia")
    .sort((a, b) => b.vencido - a.vencido);
}

/** Primer borrador, sin IA: sirve tal cual en la mayoría de casos. */
function mensajeBase(l: LeadRow, dias: number): string {
  const nombre = (l.name || "").split(" ")[0] || "Hola";
  const marca = l.company ? ` de ${l.company}` : "";
  const informe = (l.meta as Record<string, unknown> | undefined)?.informe as
    | { ok?: boolean; url?: string }
    | undefined;

  if (informe?.ok) {
    return (
      `Hola ${nombre}, te escribo de Bushido. Te mandamos el análisis${marca} hace ${dias} ` +
      `días y quería saber si alcanzaste a verlo.\n\n` +
      `Si quieres te explico en 15 minutos lo que encontramos y qué haría yo primero. ` +
      `¿Te sirve esta semana?`
    );
  }
  return (
    `Hola ${nombre}, te escribo de Bushido. Nos llegó tu solicitud${marca} y quería ` +
    `entender mejor qué necesitas antes de mandarte algo genérico.\n\n` +
    `¿Tienes 15 minutos esta semana para contarme?`
  );
}

export default function AdminSeguimiento({ leads }: { leads: LeadRow[] }) {
  const pendientes = useMemo(() => analizar(leads), [leads]);
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [redactando, setRedactando] = useState<string | null>(null);

  /** Pide a la IA un mensaje afinado con el análisis de esa marca. */
  async function redactar(p: Pendiente) {
    setRedactando(p.lead.id);
    try {
      const r = await fetch("/api/admin/seguimiento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId: p.lead.id, dias: p.dias }),
      });
      const d = await r.json();
      setTextos((t) => ({
        ...t,
        [p.lead.id]: d.ok ? d.mensaje : mensajeBase(p.lead, p.dias),
      }));
    } catch {
      setTextos((t) => ({ ...t, [p.lead.id]: mensajeBase(p.lead, p.dias) }));
    } finally {
      setRedactando(null);
    }
  }

  function abrirWhatsApp(p: Pendiente) {
    const tel = (p.lead.phone || "").replace(/\D/g, "");
    const texto = textos[p.lead.id] ?? mensajeBase(p.lead, p.dias);
    // sin teléfono, al menos que copie el mensaje
    if (!tel) {
      navigator.clipboard?.writeText(texto).catch(() => {});
      alert("Este lead no dejó teléfono. Copié el mensaje para que lo mandes por correo.");
      return;
    }
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  async function marcar(id: string, status: string) {
    await fetch("/api/admin/lead-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
    window.location.reload();
  }

  if (!pendientes.length) {
    return (
      <p className="admin-empty">
        Nadie esperando respuesta. Todos los leads están al día. 👌
      </p>
    );
  }

  const hoy = pendientes.filter((p) => p.urgencia === "hoy");

  return (
    <div className="seg">
      <p className="seg-intro">
        {hoy.length > 0 ? (
          <>
            <strong>{hoy.length}</strong> llevan demasiado tiempo sin que los toques.
            Un lead no se pierde por responder lento — se pierde cuando nadie vuelve a
            escribir.
          </>
        ) : (
          <>Estos ya cumplieron su plazo. Escríbeles antes de que se enfríen.</>
        )}
      </p>

      {pendientes.map((p) => {
        const l = p.lead;
        const wa = WHATSAPP; // por si no hay teléfono, para referencia
        void wa;
        return (
          <div className={"seg-fila u-" + p.urgencia} key={l.id}>
            <div className="seg-quien">
              <strong>{l.name || "—"}</strong>
              {l.company && <span className="seg-marca">{l.company}</span>}
              <div className="seg-meta">
                <span className={"seg-dias " + p.urgencia}>
                  {p.dias === 0 ? "hoy" : `hace ${p.dias} día${p.dias === 1 ? "" : "s"}`}
                </span>
                <span className="seg-estado">{l.status ?? "nuevo"}</span>
                {l.project && <span className="seg-proyecto">{l.project}</span>}
              </div>
            </div>

            <textarea
              className="seg-texto"
              rows={3}
              value={textos[l.id] ?? mensajeBase(l, p.dias)}
              onChange={(e) => setTextos((t) => ({ ...t, [l.id]: e.target.value }))}
            />

            <div className="seg-acciones">
              <button
                type="button"
                className="seg-btn ia"
                onClick={() => redactar(p)}
                disabled={redactando === l.id}
              >
                {redactando === l.id ? "…" : "✦ Afinar con su análisis"}
              </button>
              <button type="button" className="seg-btn wa" onClick={() => abrirWhatsApp(p)}>
                Escribir por WhatsApp →
              </button>
              <button
                type="button"
                className="seg-btn hecho"
                onClick={() => marcar(l.id, l.status === "nuevo" ? "contactado" : "propuesta")}
                title="Reinicia el contador de este lead"
              >
                Ya le escribí
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
