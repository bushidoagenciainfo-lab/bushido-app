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

/** Una ficha sirve para un casting cuando tiene nicho + formato + audiencia. */
function completa(c: CreadorLite): boolean {
  return Boolean(c.nichos?.length && c.formatos?.length && c.seguidores);
}
function falta(c: CreadorLite): string[] {
  const f: string[] = [];
  if (!c.nichos?.length) f.push("nicho");
  if (!c.formatos?.length) f.push("formato");
  if (!c.seguidores) f.push("seguidores");
  return f;
}

const ESTADOS = ["nuevo", "aprobado", "destacado", "pausado"];

/** 12.400 → "12,4K" · 1.200.000 → "1,2M" · sin dato → "—" */
function fmtSeguidores(n?: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}K`;
  return String(n);
}

/** Una línea que dice de un vistazo qué es este creador y qué sabe hacer. */
function frase(c: CreadorLite): string {
  const nichos = c.nichos ?? [];
  const formatos = c.formatos ?? [];
  const n =
    nichos.length === 0
      ? "Sin nicho definido"
      : nichos.length === 1
        ? nichos[0]
        : `${nichos[0]} y ${nichos.length - 1} nicho${nichos.length > 2 ? "s" : ""} más`;
  if (!formatos.length) return `${n} · falta definir formato`;
  const f =
    formatos.length === 1
      ? formatos[0].toLowerCase()
      : `${formatos[0].toLowerCase()} +${formatos.length - 1}`;
  return `${n} · mejor en ${f}`;
}

/** Book vacío: botón para cargar la base inicial de creadores de un clic. */
function ImportarBase() {
  const [estado, setEstado] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function importar() {
    setEstado("loading");
    try {
      const res = await fetch("/api/admin/importar-creadores", { method: "POST" });
      const d = await res.json();
      if (d.ok || d.importados) {
        setMsg(`${d.importados} creadores importados${d.yaEstaban ? ` · ${d.yaEstaban} ya estaban` : ""}.`);
        setEstado("done");
        setTimeout(() => window.location.reload(), 900);
      } else {
        setMsg(d.error || "No se pudo importar.");
        setEstado("error");
      }
    } catch {
      setMsg("Error de red.");
      setEstado("error");
    }
  }

  return (
    <div className="book-empty">
      <p className="admin-empty">
        El book está vacío. Puedes cargar la base inicial (Cúcuta) o compartir{" "}
        <a href="/gremio#creadores" target="_blank" rel="noopener noreferrer">/gremio#creadores</a>{" "}
        para que se registren solos.
      </p>
      <button type="button" className="al-gen" onClick={importar} disabled={estado === "loading"}>
        {estado === "loading" ? "Importando…" : "Cargar base inicial"}
      </button>
      {msg && (
        <p className={estado === "error" ? "al-err" : "admin-empty"} style={{ marginTop: 8 }}>
          {msg}
        </p>
      )}
    </div>
  );
}

/**
 * Editor rápido de la ficha. Está pensado para completar muchas seguidas:
 * abres el perfil, miras los seguidores, marcas nicho y formato, guardas.
 */
function EditorFicha({
  creador,
  onGuardar,
  onCancelar,
}: {
  creador: CreadorLite;
  onGuardar: (campos: Partial<CreadorLite>) => void;
  onCancelar: () => void;
}) {
  const [nichos, setNichos] = useState<string[]>(creador.nichos ?? []);
  const [formatos, setFormatos] = useState<string[]>(creador.formatos ?? []);
  const [seguidores, setSeguidores] = useState(creador.seguidores ? String(creador.seguidores) : "");
  const [tarifa, setTarifa] = useState(creador.tarifa ?? "");

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const ig = creador.instagram?.replace(/^@/, "");

  return (
    <div className="bc-editor">
      {ig && (
        <a
          className="bce-abrir"
          href={`https://instagram.com/${ig}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir @{ig} para ver sus seguidores ↗
        </a>
      )}

      <label className="bce-label">Nicho</label>
      <div className="bce-chips">
        {NICHOS_CREADOR.map((n) => (
          <button
            key={n}
            type="button"
            className={"bce-chip" + (nichos.includes(n) ? " on" : "")}
            onClick={() => toggle(nichos, setNichos, n)}
          >
            {n}
          </button>
        ))}
      </div>

      <label className="bce-label">Qué sabe hacer</label>
      <div className="bce-chips">
        {FORMATOS_CREADOR.map((f) => (
          <button
            key={f}
            type="button"
            className={"bce-chip" + (formatos.includes(f) ? " on" : "")}
            onClick={() => toggle(formatos, setFormatos, f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bce-row">
        <div>
          <label className="bce-label">Seguidores</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="12000"
            value={seguidores}
            onChange={(e) => setSeguidores(e.target.value)}
          />
        </div>
        <div>
          <label className="bce-label">Tarifa por pieza</label>
          <input
            type="text"
            placeholder="$150.000"
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
          />
        </div>
      </div>

      <div className="bce-acciones">
        <button
          type="button"
          className="bce-guardar"
          onClick={() =>
            onGuardar({
              nichos,
              formatos,
              seguidores: seguidores ? Number(seguidores) : null,
              tarifa,
            })
          }
        >
          Guardar
        </button>
        <button type="button" className="bce-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/**
 * Qué puedes OFRECER hoy, por nicho.
 *
 * El book como lista no sirve para vender. Esto responde la pregunta que
 * importa cuando entra un cliente: "en su nicho, ¿a quién tengo, con cuánta
 * audiencia y para qué formatos?" — y por dónde no puedo comprometerme.
 */
function CoberturaBook({ creadores }: { creadores: CreadorLite[] }) {
  const cobertura = useMemo(() => {
    const porNicho = new Map<
      string,
      { creadores: CreadorLite[]; alcance: number; formatos: Set<string> }
    >();
    for (const c of creadores) {
      for (const n of c.nichos ?? []) {
        const e = porNicho.get(n) ?? { creadores: [], alcance: 0, formatos: new Set<string>() };
        e.creadores.push(c);
        e.alcance += c.seguidores ?? 0;
        for (const f of c.formatos ?? []) e.formatos.add(f);
        porNicho.set(n, e);
      }
    }
    return [...porNicho.entries()]
      .map(([nicho, e]) => ({
        nicho,
        cuantos: e.creadores.length,
        alcance: e.alcance,
        formatos: [...e.formatos],
        // con menos de 3 no hay de dónde escoger para un casting
        solido: e.creadores.length >= 3,
      }))
      .sort((a, b) => b.cuantos - a.cuantos);
  }, [creadores]);

  const sinNicho = creadores.filter((c) => !c.nichos?.length).length;
  if (!cobertura.length) return null;

  return (
    <div className="cob">
      <h4>Qué puedes ofrecer por nicho</h4>
      <p className="cob-intro">
        Cuando entre un cliente de estos sectores, esto es lo que tienes para armarle una
        campaña. En verde, los nichos donde hay de dónde escoger.
      </p>
      <div className="cob-grid">
        {cobertura.map((c) => (
          <div className={"cob-nicho" + (c.solido ? " ok" : "")} key={c.nicho}>
            <div className="cob-head">
              <strong>{c.nicho}</strong>
              <span className="cob-n">
                {c.cuantos} creador{c.cuantos === 1 ? "" : "es"}
              </span>
            </div>
            {c.alcance > 0 && (
              <span className="cob-alcance">{fmtSeguidores(c.alcance)} de alcance sumado</span>
            )}
            {c.formatos.length > 0 && (
              <div className="cob-formatos">
                {c.formatos.slice(0, 4).map((f) => (
                  <span key={f}>{f}</span>
                ))}
                {c.formatos.length > 4 && <span>+{c.formatos.length - 4}</span>}
              </div>
            )}
            {!c.solido && <span className="cob-aviso">Poca banca: no prometas casting aquí</span>}
          </div>
        ))}
      </div>
      {sinNicho > 0 && (
        <p className="cob-pendiente">
          {sinNicho} creador{sinNicho === 1 ? "" : "es"} sin nicho asignado — no aparecen en
          ninguna búsqueda hasta que los clasifiques.
        </p>
      )}
    </div>
  );
}

/** Book de creadores en el panel: filtra por ciudad, nicho y formato para armar castings. */
export default function AdminCreadores({ creadores }: { creadores: CreadorLite[] }) {
  const [rows, setRows] = useState(creadores);
  const [ciudad, setCiudad] = useState("");
  const [nicho, setNicho] = useState("");
  const [formato, setFormato] = useState("");
  const [q, setQ] = useState("");
  const [soloIncompletas, setSoloIncompletas] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [sync, setSync] = useState<{ estado: "idle" | "loading" | "done" | "error"; msg: string }>({
    estado: "idle",
    msg: "",
  });

  const salud = {
    total: rows.length,
    completas: rows.filter(completa).length,
    sinNicho: rows.filter((c) => !c.nichos?.length).length,
    sinFormato: rows.filter((c) => !c.formatos?.length).length,
    sinSeguidores: rows.filter((c) => !c.seguidores).length,
  };

  /** Trae seguidores y deduce nicho desde Instagram (Business Discovery). */
  async function enriquecer(payload: { id?: string; todos?: boolean }) {
    setSync({ estado: "loading", msg: "Consultando Instagram…" });
    try {
      const res = await fetch("/api/admin/creador-enriquecer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setSync({ estado: "error", msg: d.error || "No se pudo consultar Instagram." });
        return;
      }
      const fallos = (d.reportes ?? [])
        .filter((r: { ok: boolean }) => !r.ok)
        .slice(0, 4)
        .map((r: { usuario?: string; error?: string }) => `@${r.usuario}: ${r.error}`)
        .join("\n");
      setSync({
        estado: "done",
        msg:
          `${d.conSeguidores ?? 0} con seguidores · ${d.conNicho ?? 0} con nicho nuevo` +
          `${d.fallidos ? ` · ${d.fallidos} sin datos` : ""}` +
          `${d.pendientes ? `\n⏳ Quedan ${d.pendientes} por clasificar: vuelve a darle al botón.` : ""}` +
          (fallos ? `\n${fallos}` : ""),
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setSync({ estado: "error", msg: "Error de red." });
    }
  }

  /** Guarda los campos completados de una ficha. */
  async function guardar(id: string, campos: Partial<CreadorLite>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...campos } : r)));
    setEditando(null);
    await fetch("/api/admin/creador-editar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...campos }),
    }).catch(() => {});
  }

  const ciudades = useMemo(
    () => [...new Set(creadores.map((c) => c.ciudad).filter(Boolean))] as string[],
    [creadores]
  );

  const filtrados = rows.filter((c) => {
    if (soloIncompletas && completa(c)) return false;
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
    return <ImportarBase />;
  }

  return (
    <div className="admin-book">
      {/* Sin esto el book es una agenda: aquí se ve cuánto sirve de verdad */}
      <div className="book-salud">
        <div className="bs-barra">
          <span
            className="bs-fill"
            style={{ width: `${salud.total ? (salud.completas / salud.total) * 100 : 0}%` }}
          />
        </div>
        <div className="bs-texto">
          <strong>
            {salud.completas} de {salud.total}
          </strong>{" "}
          fichas sirven para un casting (nicho + formato + audiencia)
        </div>
        <div className="bs-faltas">
          {salud.sinNicho > 0 && <span>{salud.sinNicho} sin nicho</span>}
          {salud.sinFormato > 0 && <span>{salud.sinFormato} sin formato</span>}
          {salud.sinSeguidores > 0 && <span>{salud.sinSeguidores} sin seguidores</span>}
          {salud.completas < salud.total && (
            <button
              type="button"
              className={"bs-btn" + (soloIncompletas ? " on" : "")}
              onClick={() => setSoloIncompletas((v) => !v)}
            >
              {soloIncompletas ? "Ver todas" : "Ver las que faltan →"}
            </button>
          )}
        </div>

        {/* Autocompletar desde Instagram: seguidores reales + nicho deducido */}
        <div className="bs-sync">
          <button
            type="button"
            className="bs-sync-btn"
            onClick={() => enriquecer({ todos: true })}
            disabled={sync.estado === "loading"}
          >
            {sync.estado === "loading" ? "Consultando Instagram…" : "⟳ Traer datos de Instagram"}
          </button>
          <span className="bs-sync-nota">
            Seguidores reales y nicho deducido del perfil. Solo funciona con cuentas Business o
            Creator.
          </span>
          {sync.msg && (
            <p className={"bs-sync-msg" + (sync.estado === "error" ? " err" : "")}>{sync.msg}</p>
          )}
        </div>
      </div>

      <CoberturaBook creadores={rows} />

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
              <div className="bc-id">
                <strong>{c.nombre}</strong>
                {c.ciudad && <span className="bc-city">{c.ciudad}</span>}
              </div>
              <div className="bc-seg-box">
                <span className="bc-seg-n">{fmtSeguidores(c.seguidores)}</span>
                <span className="bc-seg-l">seguidores</span>
              </div>
            </div>

            {/* La frase que resume al creador: qué nicho cubre y en qué formato. */}
            <p className="bc-frase">{frase(c)}</p>

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
            {c.formatos?.length ? (
              <div className="bc-tags">
                {c.formatos.map((f) => (
                  <span key={f} className="bc-tag f">{f}</span>
                ))}
              </div>
            ) : null}
            {c.notas && <p className="bc-notas">{c.notas}</p>}

            {/* Completar la ficha: nicho, formato y seguidores */}
            {editando === c.id ? (
              <EditorFicha
                creador={c}
                onGuardar={(campos) => guardar(c.id, campos)}
                onCancelar={() => setEditando(null)}
              />
            ) : (
              !completa(c) && (
                <div className="bc-falta-fila">
                  <button type="button" className="bc-completar" onClick={() => setEditando(c.id)}>
                    Falta {falta(c).join(", ")} · completar a mano →
                  </button>
                  {c.instagram && (
                    <button
                      type="button"
                      className="bc-traer"
                      onClick={() => enriquecer({ id: c.id })}
                      disabled={sync.estado === "loading"}
                      title="Trae seguidores y nicho desde Instagram"
                    >
                      ⟳
                    </button>
                  )}
                </div>
              )
            )}

            <div className="bc-foot">
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
