"use client";

import { useEffect, useRef, useState } from "react";
import type { WaConversacion, WaMensaje } from "@/lib/wa-inbox";

function hora(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const hoy = new Date().toDateString() === d.toDateString();
  return hoy
    ? d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

/** Bandeja de WhatsApp: el número vive en la API y no se puede abrir en el celular. */
export default function AdminWhatsApp({ conversaciones }: { conversaciones: WaConversacion[] }) {
  const [activa, setActiva] = useState<WaConversacion | null>(null);
  const [mensajes, setMensajes] = useState<WaMensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activa) return;
    setCargando(true);
    setError("");
    fetch(`/api/admin/wa?wa_id=${encodeURIComponent(activa.wa_id)}`)
      .then((r) => r.json())
      .then((d) => setMensajes(d.ok ? d.mensajes : []))
      .catch(() => setError("No se pudo cargar la conversación."))
      .finally(() => setCargando(false));
  }, [activa]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes]);

  async function enviar() {
    if (!activa || !texto.trim()) return;
    setEnviando(true);
    setError("");
    const cuerpo = texto.trim();
    try {
      const r = await fetch("/api/admin/wa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wa_id: activa.wa_id, texto: cuerpo }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.error || "No se pudo enviar.");
        return;
      }
      setMensajes((m) => [
        ...m,
        { wa_id: activa.wa_id, direccion: "saliente", texto: cuerpo, created_at: new Date().toISOString() },
      ]);
      setTexto("");
    } catch {
      setError("Error de red.");
    } finally {
      setEnviando(false);
    }
  }

  async function pedirBorrador() {
    if (!activa) return;
    setEnviando(true);
    setError("");
    try {
      const r = await fetch("/api/admin/wa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wa_id: activa.wa_id, borrador: true }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) setError(d.error || "No se pudo redactar.");
      else setTexto(d.borrador);
    } catch {
      setError("Error de red.");
    } finally {
      setEnviando(false);
    }
  }

  if (!conversaciones.length) {
    return (
      <p className="admin-empty">
        Todavía no hay conversaciones. Cuando alguien responda al WhatsApp de Bushido, aparece
        aquí. Si ya te respondieron y no ves nada, falta conectar el webhook en Meta
        (ver GUIA-WHATSAPP-BANDEJA.md).
      </p>
    );
  }

  return (
    <div className="wa">
      {/* lista de conversaciones */}
      <div className="wa-lista">
        {conversaciones.map((c) => (
          <button
            key={c.wa_id}
            type="button"
            className={"wa-chat" + (activa?.wa_id === c.wa_id ? " on" : "")}
            onClick={() => setActiva(c)}
          >
            <div className="wa-chat-top">
              <strong>{c.nombre || `+${c.wa_id}`}</strong>
              <span className="wa-hora">{hora(c.fecha)}</span>
            </div>
            <div className="wa-chat-prev">{c.ultimo}</div>
            <div className="wa-chat-pie">
              {c.sinLeer > 0 && <span className="wa-badge">{c.sinLeer}</span>}
              <span className={"wa-ventana" + (c.ventanaAbierta ? " abierta" : "")}>
                {c.ventanaAbierta
                  ? `puedes responder · ${Math.floor(c.minutosRestantes / 60)}h restantes`
                  : "ventana cerrada"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* conversación */}
      <div className="wa-panel">
        {!activa ? (
          <p className="admin-empty">Elige una conversación.</p>
        ) : (
          <>
            <div className="wa-panel-head">
              <div>
                <strong>{activa.nombre || `+${activa.wa_id}`}</strong>
                <span className="wa-tel">+{activa.wa_id}</span>
              </div>
              <a
                className="wa-link"
                href={`https://wa.me/${activa.wa_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en WhatsApp ↗
              </a>
            </div>

            <div className="wa-hilo">
              {cargando ? (
                <p className="admin-empty">Cargando…</p>
              ) : (
                mensajes.map((m, k) => (
                  <div key={m.id ?? k} className={"wa-msg " + m.direccion}>
                    <span>{m.texto}</span>
                    <em>{hora(m.created_at)}</em>
                  </div>
                ))
              )}
              <div ref={finRef} />
            </div>

            {!activa.ventanaAbierta && (
              <p className="wa-aviso">
                Pasaron más de 24 horas desde su último mensaje. Meta no permite escribir texto
                libre hasta que la persona vuelva a escribir.
              </p>
            )}

            <div className="wa-responder">
              <textarea
                rows={3}
                placeholder="Escribe tu respuesta…"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                disabled={!activa.ventanaAbierta}
              />
              <div className="wa-acciones">
                <button
                  type="button"
                  className="wa-borrador"
                  onClick={pedirBorrador}
                  disabled={enviando}
                  title="Propone qué contestar según la conversación y su análisis"
                >
                  {enviando ? "…" : "✦ Sugerir respuesta"}
                </button>
                <button
                  type="button"
                  className="wa-enviar"
                  onClick={enviar}
                  disabled={enviando || !texto.trim() || !activa.ventanaAbierta}
                >
                  Enviar →
                </button>
              </div>
              {error && <p className="wa-error">{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
