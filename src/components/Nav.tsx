"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV } from "@/lib/site";
import { openAnalisis } from "@/lib/ui";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="nav" role="navigation">
        <Link href="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          BUSH<em>I</em>DO
        </Link>
        <ul className="nav-links">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href}>{n.label}</Link>
            </li>
          ))}
        </ul>
        <button type="button" className="nav-cta" onClick={openAnalisis}>
          Análisis gratis →
        </button>
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
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Inicio
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
            {n.label}
          </Link>
        ))}
        <button
          type="button"
          style={{ color: "var(--sepp)" }}
          onClick={() => {
            setMenuOpen(false);
            openAnalisis();
          }}
        >
          Análisis gratis →
        </button>
      </div>
    </>
  );
}
