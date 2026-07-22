"use client";

import { useEffect, useMemo, useState } from "react";
import { EQUIPOS, EQUIPO_CATS } from "@/lib/equipos";
import { WHATSAPP } from "@/lib/site";

type Status = "idle" | "loading" | "done" | "error";
const STORE_KEY = "bushido_rental_cart";

// imagen representativa por categoría (fallback: primer equipo de la categoría)
const COVERS: Record<string, string> = {
  "Cámaras": "canon-r5",
  "Ópticas": "canon-rf-24-105",
  "Iluminación": "nanlite-forza-720b-bi-color-led",
  "Monitores": "atomos-neon-17",
  "Movimiento": "zhiyun-crane-3s",
  "Grip": "benro-bv6",
  "Wireless": "hollyland-mars-400spro",
  "Accesorios": "tilta-tilta-mb-t12-matte-box",
  "Transporte": "camionte-dfsk-c35",
};

export default function EquiposCatalog() {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      if (Array.isArray(s)) setSelected(s);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(selected));
    } catch {}
  }, [selected]);
  useEffect(() => {
    document.body.classList.toggle("drawer-open", open);
  }, [open]);

  const bySlug = useMemo(() => new Map(EQUIPOS.map((e) => [e.slug, e])), []);
  const countByCat = useMemo(() => {
    const m: Record<string, number> = {};
    EQUIPOS.forEach((e) => (m[e.cat] = (m[e.cat] || 0) + 1));
    return m;
  }, []);
  const coverFor = (cat: string) =>
    COVERS[cat] || EQUIPOS.find((e) => e.cat === cat)?.slug || "";

  const items = openCat ? EQUIPOS.filter((e) => e.cat === openCat) : [];

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = ((fd.get("name") as string) || "").trim();
    const phone = ((fd.get("phone") as string) || "").trim();
    const dates = ((fd.get("dates") as string) || "").trim();
    const message = ((fd.get("message") as string) || "").trim();
    const list = selected.map((s) => bySlug.get(s)?.name || s);

    if (!name || phone.replace(/\D/g, "").length < 5 || list.length === 0) {
      setError("Falta tu nombre, WhatsApp o equipos en la lista.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          dates,
          message,
          items: list,
          website_hp: (fd.get("website_hp") as string) || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No pudimos registrar tu solicitud.");
        setStatus("error");
        return;
      }
      const lines = [
        "*Solicitud de alquiler · bushidoav.com*",
        "",
        `👤 *Nombre:* ${name}`,
        `📱 *WhatsApp:* +57 ${phone}`,
      ];
      if (dates) lines.push(`📅 *Fechas:* ${dates}`);
      lines.push("", "🎬 *Equipos:*");
      list.forEach((i) => lines.push(`• ${i}`));
      if (message) lines.push("", `📝 *Nota:* ${message}`);
      window.open(
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`,
        "_blank",
        "noopener"
      );

      setStatus("done");
      setSelected([]);
      form.reset();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <>
      {openCat === null ? (
        /* ── NIVEL 1: categorías ── */
        <div className="cat-grid">
          {EQUIPO_CATS.map((cat) => (
            <button
              key={cat}
              type="button"
              className="cat-card"
              onClick={() => setOpenCat(cat)}
            >
              <div className="cc-img" style={{ backgroundImage: `url('/catalogo/${coverFor(cat)}.jpg')` }} />
              <div className="cc-scrim" />
              <div className="cc-body">
                <div>
                  <div className="cc-name">{cat}</div>
                  <span className="cc-count">{countByCat[cat]} equipos</span>
                </div>
                <span className="cc-go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* ── NIVEL 2: equipos de la categoría ── */
        <>
          <div className="cat-back">
            <button type="button" className="back-btn" onClick={() => setOpenCat(null)}>
              <span aria-hidden="true">←</span> Categorías
            </button>
            <h2>
              <em>{openCat}</em>
            </h2>
            <span className="cb-count">{items.length} equipos</span>
          </div>

          <div className="equipos-grid">
            {items.map((e) => {
              const on = selected.includes(e.slug);
              return (
                <div key={e.slug} className={"eq-card" + (on ? " selected" : "")}>
                  <div className="eq-thumb">
                    <div className="img" style={{ backgroundImage: `url('/catalogo/${e.slug}.jpg')` }} />
                    <span className="eq-cat">{e.cat}</span>
                  </div>
                  <div className="eq-body">
                    <div className="eq-name">{e.name}</div>
                    <button type="button" className="eq-add" onClick={() => toggle(e.slug)}>
                      {on ? <>Quitar ✓</> : <>Agregar <span aria-hidden="true">+</span></>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* botón flotante del carrito (siempre visible si hay selección) */}
      <button
        type="button"
        className={"cart-fab" + (selected.length > 0 ? " shown" : "")}
        onClick={() => setOpen(true)}
      >
        <span>Ver solicitud</span>
        <span className="count">{selected.length}</span>
      </button>

      {/* drawer del carrito */}
      <div
        className={"drawer-backdrop" + (open ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <aside className={"drawer" + (open ? " open" : "")} role="dialog" aria-modal="true">
          <button className="drawer-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {status === "done" ? (
            <div className="form-success" style={{ display: "block", padding: "40px 0" }}>
              <div className="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4>¡Solicitud enviada!</h4>
              <p>Se abrió WhatsApp con tu lista. Dale enviar y coordinamos disponibilidad y valores.</p>
              <button type="button" className="again" onClick={() => { setStatus("idle"); setOpen(false); }}>
                Volver al catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="d-cat">Tu solicitud</div>
              <h3>
                Equipos <em>seleccionados</em>
              </h3>

              {selected.length === 0 ? (
                <p className="cart-empty">Aún no agregas equipos. Entra a una categoría y agrégalos.</p>
              ) : (
                <div style={{ margin: "18px 0 8px" }}>
                  {selected.map((s) => {
                    const eq = bySlug.get(s);
                    return (
                      <div key={s} className="cart-item">
                        <div>
                          <div className="ci-name">{eq?.name || s}</div>
                          <div className="ci-cat">{eq?.cat}</div>
                        </div>
                        <button type="button" className="ci-remove" aria-label="Quitar" onClick={() => toggle(s)}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="field">
                  <label htmlFor="r-name">
                    Nombre <span className="req">*</span>
                  </label>
                  <input id="r-name" name="name" type="text" placeholder="Tu nombre" required />
                </div>
                <div className="field">
                  <label htmlFor="r-phone">
                    WhatsApp <span className="req">*</span>
                  </label>
                  <div className="prefix-wrap">
                    <span className="prefix">+57</span>
                    <input id="r-phone" name="phone" type="tel" inputMode="numeric" placeholder="300 000 0000" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="r-dates">
                    Fechas <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>(opcional)</span>
                  </label>
                  <input id="r-dates" name="dates" type="text" placeholder="Ej: 12–14 de octubre" />
                </div>
                <div className="field">
                  <label htmlFor="r-msg">
                    Nota <span style={{ color: "var(--bone-ghost)", fontWeight: "normal" }}>(opcional)</span>
                  </label>
                  <textarea id="r-msg" name="message" rows={2} placeholder="Ciudad, tipo de proyecto, lo que necesites…" />
                </div>

                <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />

                {status === "error" && (
                  <div style={{ color: "var(--sepp)", fontFamily: "var(--mono)", fontSize: 12 }}>{error}</div>
                )}

                <button type="submit" className="btn btn-primary" disabled={status === "loading" || selected.length === 0} style={{ width: "100%", justifyContent: "center" }}>
                  {status === "loading" ? "Enviando…" : "Enviar solicitud por WhatsApp"}
                  <span className="arrow">→</span>
                </button>
                <p className="legal-note" style={{ textAlign: "center" }}>
                  Sin pago en línea. Coordinamos disponibilidad y valores por WhatsApp.
                </p>
              </form>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
