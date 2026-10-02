"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";
import { track } from "@/lib/track";

// Rutas que solo aparecen en el menú móvil (en desktop viven dentro de Gremio).
const EXTRA = [
  { href: "/equipos", label: "Equipos" },
  { href: "/descargables", label: "Descargables" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const activa = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="nav" role="navigation">
        <Link href="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          BUSH<em>I</em>DO
        </Link>
        <ul className="nav-links">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={activa(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Dos intenciones, dos botones: cotizar (venta directa) y análisis (lead magnet) */}
        <div className="nav-ctas">
          <button type="button" className="nav-cta nav-cta--ghost" onClick={() => openAnalisis("nav")}>
            Análisis gratis
          </button>
          <Link href="/contacto#form" className="nav-cta" onClick={() => track("cta", "cotizar", { origen: "nav" })}>
            Cotizar →
          </Link>
        </div>
        <button
          type="button"
          className="nav-mobile-btn"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      <div className={"mobile-menu" + (menuOpen ? " open" : "")}>
        <button className="mobile-close" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Link href="/" onClick={() => setMenuOpen(false)} aria-current={pathname === "/" ? "page" : undefined}>
          Inicio
        </Link>
        {[...NAV, ...EXTRA].map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} aria-current={activa(n.href) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
        <Link
          href="/contacto#form"
          className="mm-cotizar"
          onClick={() => {
            setMenuOpen(false);
            track("cta", "cotizar", { origen: "menu" });
          }}
        >
          Cotizar mi proyecto →
        </Link>
        <button
          type="button"
          style={{ color: "var(--sepp)" }}
          onClick={() => {
            setMenuOpen(false);
            openAnalisis("menu");
          }}
        >
          Análisis gratis →
        </button>
      </div>
    </>
  );
}
